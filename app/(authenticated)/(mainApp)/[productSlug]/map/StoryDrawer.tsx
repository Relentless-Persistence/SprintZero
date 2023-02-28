import {
	BlockOutlined,
	CloseOutlined,
	CodeOutlined,
	DollarOutlined,
	FlagOutlined,
	LinkOutlined,
	NumberOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Button, Checkbox, Drawer, Form, Input, Popover, Segmented, Tag} from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {doc, getDoc} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useEffect, useState} from "react"
import {useDocument, useDocumentData} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"
import {useInterval} from "react-use"

import type {StoryMapMeta} from "./meta"
import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {z} from "zod"
import type {Id} from "~/types"
import type {User} from "~/types/db/Users"

import Comments from "~/components/Comments"
import LinkTo from "~/components/LinkTo"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import {ProductConverter} from "~/types/db/Products"
import {StorySchema, sprintColumns} from "~/types/db/StoryMapStates"
import {UserConverter} from "~/types/db/Users"
import dollarFormat from "~/utils/dollarFormat"
import {db} from "~/utils/firebase"
import {formValidateStatus} from "~/utils/formValidateStatus"
import {deleteItem, updateItem} from "~/utils/storyMap"
import {useActiveProductId} from "~/utils/useActiveProductId"

dayjs.extend(relativeTime)

const formSchema = StorySchema.pick({
	branchName: true,
	designEffort: true,
	designLink: true,
	engineeringEffort: true,
	pageLink: true,
	sprintColumn: true,
	peopleIds: true,
	versionId: true,
})
type FormInputs = z.infer<typeof formSchema>

export type StoryDrawerProps = {
	meta: StoryMapMeta
	storyId: Id
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({meta, storyId, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)
	const [newAcceptanceCriterionInput, setNewAcceptanceCriterionInput] = useState(``)
	const [newBugInput, setNewBugInput] = useState(``)
	const story = meta.stories.find((story) => story.id === storyId)!
	const [commentType, setCommentType] = useState<`code` | `design`>(`design`)

	const [localStoryName, setLocalStoryName] = useState(story.name)
	useEffect(() => {
		setLocalStoryName(story.name)
	}, [story.name])

	const [lastModifiedText, setLastModifiedText] = useState<string | undefined>(undefined)
	useInterval(() => {
		setLastModifiedText(dayjs(story.updatedAt.toMillis()).fromNow())
	}, 1000)

	const [lastModifiedUser] = useDocument(doc(db, `Users`, story.updatedAtUserId).withConverter(UserConverter))

	const [description, setDescription] = useState(story.description)
	useEffect(() => {
		setDescription(story.description)
	}, [story.description])

	const activeProductId = useActiveProductId()
	const [product] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const teamMembers = useQueries({
		queries: Object.keys(product?.members ?? {}).map((userId) => ({
			queryKey: [`user`, userId],
			queryFn: async () => await getDoc(doc(db, `Users`, userId).withConverter(UserConverter)),
		})),
	})

	const {control, handleSubmit, getFieldState, formState, reset} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			branchName: story.branchName,
			designLink: story.designLink,
			designEffort: story.designEffort,
			engineeringEffort: story.engineeringEffort,
			pageLink: story.pageLink,
			sprintColumn: story.sprintColumn,
			peopleIds: story.peopleIds,
			versionId: story.versionId,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		await updateItem(meta.storyMapState, story.id, data, meta.allVersions)
		setEditMode(false)
	})

	const toggleAcceptanceCriterion = async (id: string, checked: boolean) => {
		await updateItem(
			meta.storyMapState,
			story.id,
			{
				acceptanceCriteria: produce(story.acceptanceCriteria, (draft) => {
					const index = draft.findIndex((criterion) => criterion.id === id)
					draft[index]!.checked = checked
				}),
			},
			meta.allVersions,
		)
	}

	const addAcceptanceCriterion = async () => {
		await updateItem(
			meta.storyMapState,
			story.id,
			{
				acceptanceCriteria: [
					...story.acceptanceCriteria,
					{id: nanoid() as Id, name: newAcceptanceCriterionInput, checked: false},
				],
			},
			meta.allVersions,
		)
	}

	const toggleBug = async (id: string, checked: boolean) => {
		await updateItem(
			meta.storyMapState,
			story.id,
			{
				bugs: produce(story.bugs, (draft) => {
					const index = draft.findIndex((bug) => bug.id === id)
					draft[index]!.checked = checked
				}),
			},
			meta.allVersions,
		)
	}

	const addBug = async () => {
		await updateItem(
			meta.storyMapState,
			story.id,
			{
				bugs: [...story.bugs, {id: nanoid() as Id, name: newBugInput, checked: false}],
			},
			meta.allVersions,
		)
	}

	const totalEffort = story.designEffort + story.engineeringEffort

	const peoplePopoverItems = story.peopleIds
		.map((userId) => teamMembers.find((user) => user.data?.id === userId)?.data)
		.filter((user): user is QueryDocumentSnapshot<User> => user?.exists() ?? false)
		.map((user) => (
			<div key={user.id} className="flex items-center gap-2 rounded bg-[#f0f0f0] p-2">
				<Avatar src={user.data().avatar} shape="square" size="small" />
				{user.data().name}
			</div>
		))

	return (
		<Drawer
			placement="bottom"
			closable={false}
			height={434}
			open={isOpen}
			onClose={() => onClose()}
			title={
				editMode ? (
					<div className="flex h-14 items-center">
						<Button
							type="primary"
							danger
							onClick={() => {
								deleteItem(meta.storyMapState, story.id).catch(console.error)
							}}
						>
							Delete
						</Button>
					</div>
				) : (
					<div className="flex h-14 flex-col justify-center gap-1">
						<div className="flex items-end gap-4">
							<div className="relative w-fit min-w-[1rem]">
								<p>{localStoryName || `_`}</p>
								<input
									value={localStoryName}
									className="absolute inset-0"
									onChange={(e) => {
										setLocalStoryName(e.target.value)
										updateItem(meta.storyMapState, story.id, {name: e.target.value}, meta.allVersions).catch(
											console.error,
										)
									}}
								/>
							</div>
							{lastModifiedText && lastModifiedUser?.exists() && (
								<p className="text-sm font-normal text-textTertiary">
									Last modified {lastModifiedText} by {lastModifiedUser.data().name}
								</p>
							)}
						</div>
						<div>
							<div className="relative flex gap-1">
								<Tag color="#585858" icon={<NumberOutlined />}>
									{totalEffort} point{totalEffort === 1 ? `` : `s`}
								</Tag>
								<Tag
									color={typeof product?.effortCost === `number` ? `#585858` : `#f5f5f5`}
									icon={<DollarOutlined />}
									className={clsx(typeof product?.effortCost !== `number` && `!border-current !text-[#d9d9d9]`)}
								>
									{dollarFormat((product?.effortCost ?? 0) * totalEffort)}
								</Tag>
								<Tag color="#585858" icon={<FlagOutlined />}>
									{sprintColumns[story.sprintColumn]}
								</Tag>
								<Popover
									placement="bottom"
									content={
										<div className="-m-1 flex flex-col gap-2">
											{peoplePopoverItems.length > 0 ? (
												peoplePopoverItems
											) : (
												<p className="italic text-textTertiary">No people assigned to this story.</p>
											)}
										</div>
									}
								>
									<Tag color="#585858" icon={<UserOutlined />} className="text-sm">
										{story.peopleIds.length}
									</Tag>
								</Popover>

								<div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-1">
									<Tag
										color={story.branchName ? `#0958d9` : `#f5f5f5`}
										icon={<CodeOutlined />}
										style={story.branchName ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
									>
										{story.branchName ?? `No branch`}
									</Tag>
									<LinkTo href={story.designLink} openInNewTab>
										<Tag
											color={story.designLink ? `#0958d9` : `#f5f5f5`}
											icon={<BlockOutlined />}
											style={story.designLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
										>
											Design
										</Tag>
									</LinkTo>
									<LinkTo href={story.pageLink} openInNewTab>
										<Tag
											color={story.pageLink ? `#0958d9` : `#f5f5f5`}
											icon={<LinkOutlined />}
											style={story.pageLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
										>
											Page
										</Tag>
									</LinkTo>
								</div>
							</div>
						</div>
					</div>
				)
			}
			extra={
				<div className="flex items-center gap-4">
					{editMode ? (
						<>
							<Button
								onClick={() => {
									setEditMode(false)
									reset()
								}}
							>
								Cancel
							</Button>
							<Button type="primary" htmlType="submit" form="story-form">
								Done
							</Button>
						</>
					) : (
						<>
							<Button onClick={() => setEditMode(true)}>Edit</Button>
							<button type="button" onClick={() => onClose()}>
								<CloseOutlined />
							</button>
						</>
					)}
				</div>
			}
		>
			{editMode ? (
				<Form
					id="story-form"
					layout="vertical"
					className="flex flex-col gap-4"
					onFinish={() => {
						onSubmit().catch(console.error)
					}}
				>
					<div className="flex gap-8">
						<Form.Item label={<span className="font-semibold">Team members</span>} className="grow">
							<RhfSelect
								control={control}
								name="peopleIds"
								mode="multiple"
								options={teamMembers
									.map(({data: memberDoc}) => memberDoc)
									.filter((user): user is QueryDocumentSnapshot<User> => user?.exists() ?? false)
									.map((user) => ({label: user.data().name, value: user.id}))}
							/>
						</Form.Item>
						<Form.Item label={<span className="font-semibold">Design</span>}>
							<RhfSegmented control={control} name="designEffort" options={[1, 2, 3, 5, 8, 13]} />
						</Form.Item>
						<Form.Item label={<span className="font-semibold">Engineering</span>}>
							<RhfSegmented control={control} name="engineeringEffort" options={[1, 2, 3, 5, 8, 13]} />
						</Form.Item>
						<Form.Item label={<span className="font-semibold">Version</span>} className="shrink-0 basis-20">
							<RhfSelect
								control={control}
								name="versionId"
								options={meta.allVersions.docs.map((version) => ({label: version.data().name, value: version.id}))}
							/>
						</Form.Item>
						<Form.Item label={<span className="font-semibold">Status</span>} className="shrink-0 basis-56">
							<RhfSelect
								control={control}
								name="sprintColumn"
								options={Object.entries(sprintColumns).map(([key, value]) => ({label: value, value: key}))}
							/>
						</Form.Item>
					</div>
					<Form.Item
						label="Design"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`designLink`, formState))}
						help={formState.errors.designLink?.message}
					>
						<RhfInput control={control} name="designLink" placeholder="https://" />
					</Form.Item>
					<Form.Item
						label="Branch"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`branchName`, formState))}
						help={formState.errors.branchName?.message}
					>
						<RhfInput control={control} name="branchName" />
					</Form.Item>
					<Form.Item
						label="Page"
						hasFeedback
						validateStatus={formValidateStatus(getFieldState(`pageLink`, formState))}
						help={formState.errors.pageLink?.message}
					>
						<RhfInput control={control} name="pageLink" placeholder="https://" />
					</Form.Item>
				</Form>
			) : (
				<div className="grid h-full grid-cols-2 gap-6">
					{/* Left column */}
					<div className="flex h-full min-h-0 flex-col gap-4">
						<div className="flex max-h-[calc(100%-8rem)] flex-col gap-2">
							<p className="text-lg font-semibold">Story</p>
							<Input.TextArea
								rows={3}
								value={description}
								onChange={(e) => {
									setDescription(e.target.value)
									updateItem(
										meta.storyMapState,
										story.id,
										{
											description: e.target.value,
										},
										meta.allVersions,
									).catch(console.error)
								}}
								className="max-h-[calc(100%-2rem)]"
							/>
						</div>

						<div className="grid min-h-0 grow basis-0 grid-cols-2 gap-6">
							<div className="flex min-h-0 flex-col gap-2">
								<p className="text-lg font-semibold">Acceptance Criteria</p>
								<div className="flex flex-col gap-2 overflow-auto p-0.5">
									{story.acceptanceCriteria.map((criterion) => (
										<Checkbox
											key={criterion.id}
											checked={criterion.checked}
											onChange={(e) => {
												toggleAcceptanceCriterion(criterion.id, e.target.checked).catch(console.error)
											}}
											style={{marginLeft: `0px`}}
										>
											{criterion.name}
										</Checkbox>
									))}
									<Input
										size="small"
										placeholder="Add item"
										value={newAcceptanceCriterionInput}
										onChange={(e) => setNewAcceptanceCriterionInput(e.target.value)}
										onPressEnter={() => {
											addAcceptanceCriterion()
												.then(() => {
													setNewAcceptanceCriterionInput(``)
												})
												.catch(console.error)
										}}
										className="w-40"
									/>
								</div>
							</div>

							<div className="flex min-h-0 flex-col gap-2 overflow-auto">
								<p className="text-lg font-semibold">Bugs</p>
								<div className="flex flex-col gap-2 overflow-auto p-0.5">
									{story.bugs.map((bug) => (
										<Checkbox
											key={bug.id}
											checked={bug.checked}
											onChange={(e) => {
												toggleBug(bug.id, e.target.checked).catch(console.error)
											}}
											className="w-full [&_span:last-child]:grow [&_span:last-child]:basis-0 [&_span:last-child]:truncate"
										>
											{bug.name}
										</Checkbox>
									))}
									<Input
										size="small"
										placeholder="Add item"
										value={newBugInput}
										onChange={(e) => setNewBugInput(e.target.value)}
										onPressEnter={() => {
											addBug()
												.then(() => {
													setNewBugInput(``)
												})
												.catch(console.error)
										}}
										className="w-40"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col gap-2">
						<div className="flex items-center justify-between">
							<p className="text-lg font-semibold">Comments</p>
							<Segmented
								size="small"
								value={commentType}
								onChange={(value) => setCommentType(value as `code` | `design`)}
								options={[
									{label: `Design`, icon: <BlockOutlined />, value: `design`},
									{label: `Code`, icon: <CodeOutlined />, value: `code`},
								]}
							/>
						</div>
						<div className="relative grow">
							<Comments
								storyMapStateId={meta.storyMapState.id as Id}
								parentId={storyId}
								flagged={story.ethicsColumn !== null}
								commentType={commentType}
								onFlag={() => {
									updateItem(meta.storyMapState, story.id, {ethicsColumn: `underReview`}, meta.allVersions).catch(
										console.error,
									)
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</Drawer>
	)
}

export default StoryDrawer
