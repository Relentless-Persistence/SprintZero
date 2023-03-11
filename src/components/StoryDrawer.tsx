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
import {Avatar, Button, Checkbox, Drawer, Form, Input, Popover, Segmented, Tag} from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {collection} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useEffect, useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"
import {useInterval} from "react-use"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {z} from "zod"
import type {Member} from "~/types/db/Products/Members"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import Comments from "~/components/Comments"
import LinkTo from "~/components/LinkTo"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfSelect from "~/components/rhf/RhfSelect"
import {MemberConverter} from "~/types/db/Products/Members"
import {StoryMapItemSchema, sprintColumns} from "~/types/db/Products/StoryMapItems"
import {conditionalThrow} from "~/utils/conditionalThrow"
import dollarFormat from "~/utils/dollarFormat"
import {formValidateStatus} from "~/utils/formValidateStatus"
import {debouncedUpdateItem, deleteItem, updateItem} from "~/utils/storyMap"
import {useTheme} from "~/utils/ThemeContext"

dayjs.extend(relativeTime)

const formSchema = StoryMapItemSchema.pick({
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
	storyMapItems: QuerySnapshot<StoryMapItem>
	versions: QuerySnapshot<Version>
	storyId: string
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({storyMapItems, versions, storyId, isOpen, onClose}) => {
	const {product} = useAppContext()
	const [editMode, setEditMode] = useState(false)
	const [newAcceptanceCriterionInput, setNewAcceptanceCriterionInput] = useState(``)
	const [newBugInput, setNewBugInput] = useState(``)
	const story = storyMapItems.docs.find((story) => story.id === storyId)!
	const storyData = story.data()
	const [commentType, setCommentType] = useState<`code` | `design`>(`design`)

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	conditionalThrow(membersError)

	const [lastModifiedText, setLastModifiedText] = useState<string | undefined>(undefined)
	useInterval(() => {
		setLastModifiedText(dayjs(storyData.updatedAt.toMillis()).fromNow())
	}, 200)

	const [localStoryName, setLocalStoryName] = useState(storyData.name)
	useEffect(() => {
		setLocalStoryName(storyData.name)
	}, [storyData.name])

	const [description, setDescription] = useState(storyData.description)
	useEffect(() => {
		setDescription(storyData.description)
	}, [storyData.description])

	const {control, handleSubmit, getFieldState, formState, reset} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			branchName: storyData.branchName,
			designLink: storyData.designLink,
			designEffort: storyData.designEffort,
			engineeringEffort: storyData.engineeringEffort,
			pageLink: storyData.pageLink,
			sprintColumn: storyData.sprintColumn,
			peopleIds: storyData.peopleIds,
			versionId: storyData.versionId,
		},
	})

	const onSubmit = handleSubmit(async (data) => {
		await updateItem(product, storyMapItems, versions, story.id, data)
		setEditMode(false)
	})

	const toggleAcceptanceCriterion = async (id: string, checked: boolean) => {
		await updateItem(product, storyMapItems, versions, story.id, {
			acceptanceCriteria: produce(storyData.acceptanceCriteria, (draft) => {
				const index = draft.findIndex((criterion) => criterion.id === id)
				draft[index]!.checked = checked
			}),
		})
	}

	const addAcceptanceCriterion = async () => {
		if (!newAcceptanceCriterionInput) return
		await updateItem(product, storyMapItems, versions, story.id, {
			acceptanceCriteria: [
				...storyData.acceptanceCriteria,
				{id: nanoid(), name: newAcceptanceCriterionInput, checked: false},
			],
		})
	}

	const toggleBug = async (id: string, checked: boolean) => {
		await updateItem(product, storyMapItems, versions, story.id, {
			bugs: produce(storyData.bugs, (draft) => {
				const index = draft.findIndex((bug) => bug.id === id)
				draft[index]!.checked = checked
			}),
		})
	}

	const addBug = async () => {
		if (!newBugInput) return
		await updateItem(product, storyMapItems, versions, story.id, {
			bugs: [...storyData.bugs, {id: nanoid(), name: newBugInput, checked: false}],
		})
	}

	const totalEffort = storyData.designEffort + storyData.engineeringEffort

	const peoplePopoverItems = story
		.data()
		.peopleIds.map((userId) => members?.docs.find((user) => user.id === userId))
		.filter((member): member is QueryDocumentSnapshot<Member> => member?.exists() ?? false)
		.map((member) => (
			<div key={member.id} className="flex items-center gap-2 rounded bg-[#f0f0f0] p-2">
				<Avatar src={member.data().avatar} shape="square" size="small" />
				{member.data().name}
			</div>
		))

	const theme = useTheme()

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
								deleteItem(product, storyMapItems, versions, story.id).catch(console.error)
							}}
						>
							Delete
						</Button>
					</div>
				) : (
					<div className="flex h-14 flex-col justify-center gap-2">
						<div className="flex items-end gap-4">
							<div className="relative w-fit min-w-[1rem]">
								<p>{localStoryName || `_`}</p>
								<input
									value={localStoryName}
									className="absolute inset-0 bg-transparent"
									onChange={(e) => {
										setLocalStoryName(e.target.value)
										updateItem(product, storyMapItems, versions, story.id, {name: e.target.value}).catch(console.error)
									}}
								/>
							</div>
							{lastModifiedText && members && (
								<p className="text-sm font-normal text-textTertiary">
									Last modified {lastModifiedText} by{` `}
									{members.docs.find((user) => user.id === storyData.updatedAtUserId)!.data().name}
								</p>
							)}
						</div>
						<div>
							<div className="relative flex gap-1">
								<Tag color="#585858" icon={<NumberOutlined />}>
									{totalEffort} point{totalEffort === 1 ? `` : `s`}
								</Tag>
								<Tag
									color={
										typeof product.data().effortCost === `number`
											? `#585858`
											: theme === `light`
											? `#f5f5f5`
											: `#333333`
									}
									icon={<DollarOutlined />}
									className={clsx(
										typeof product.data().effortCost !== `number` &&
											`!border-current !text-[#d9d9d9] dark:!text-[#555555]`,
									)}
								>
									{dollarFormat((product.data().effortCost ?? 0) * totalEffort)}
								</Tag>
								<Tag color="#585858" icon={<FlagOutlined />}>
									{sprintColumns[storyData.sprintColumn]}
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
										{storyData.peopleIds.length}
									</Tag>
								</Popover>

								<div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-1">
									<Tag
										color={storyData.branchName ? `#0958d9` : theme === `light` ? `#f5f5f5` : `#333333`}
										icon={<CodeOutlined />}
										className={clsx(!storyData.branchName && `!border-current !text-[#d9d9d9] dark:!text-[#555555]`)}
									>
										{storyData.branchName ?? `No branch`}
									</Tag>
									<LinkTo href={storyData.designLink} openInNewTab>
										<Tag
											color={storyData.designLink ? `#0958d9` : theme === `light` ? `#f5f5f5` : `#333333`}
											icon={<BlockOutlined />}
											className={clsx(!storyData.designLink && `!border-current !text-[#d9d9d9] dark:!text-[#555555]`)}
										>
											Design
										</Tag>
									</LinkTo>
									<LinkTo href={storyData.pageLink} openInNewTab>
										<Tag
											color={storyData.pageLink ? `#0958d9` : theme === `light` ? `#f5f5f5` : `#333333`}
											icon={<LinkOutlined />}
											style={storyData.pageLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
											className={clsx(!storyData.pageLink && `!border-current !text-[#d9d9d9] dark:!text-[#555555]`)}
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
									reset({
										branchName: storyData.branchName,
										designLink: storyData.designLink,
										designEffort: storyData.designEffort,
										engineeringEffort: storyData.engineeringEffort,
										pageLink: storyData.pageLink,
										sprintColumn: storyData.sprintColumn,
										peopleIds: storyData.peopleIds,
										versionId: storyData.versionId,
									})
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
				<form
					id="story-form"
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						onSubmit(e).catch(console.error)
					}}
				>
					<div className="flex gap-8">
						<label className="flex grow flex-col gap-2">
							<span className="font-semibold">Team members</span>
							<RhfSelect
								control={control}
								name="peopleIds"
								mode="multiple"
								options={members?.docs
									.filter((member): member is QueryDocumentSnapshot<Member> => member.exists())
									.map((member) => ({label: member.data().name, value: member.id}))}
							/>
						</label>
						<label className="flex flex-col gap-2">
							<span className="font-semibold">Design Effort</span>
							<RhfSegmented control={control} name="designEffort" options={[1, 2, 3, 5, 8, 13]} />
						</label>
						<label className="flex flex-col gap-2">
							<span className="font-semibold">Engineering Effort</span>
							<RhfSegmented control={control} name="engineeringEffort" options={[1, 2, 3, 5, 8, 13]} />
						</label>
						<label className="flex shrink-0 basis-20 flex-col gap-2">
							<span className="font-semibold">Version</span>
							<RhfSelect
								control={control}
								name="versionId"
								options={versions.docs.map((version) => ({label: version.data().name, value: version.id}))}
							/>
						</label>
						<label className="flex shrink-0 basis-56 flex-col gap-2">
							<span className="font-semibold">Status</span>
							<RhfSelect
								control={control}
								name="sprintColumn"
								options={Object.entries(sprintColumns).map(([key, value]) => ({label: value, value: key}))}
							/>
						</label>
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
				</form>
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
									debouncedUpdateItem(product, storyMapItems, versions, story.id, {description: e.target.value})?.catch(
										console.error,
									)
								}}
								className="max-h-[calc(100%-2rem)]"
							/>
						</div>

						<div className="grid min-h-0 grow basis-0 grid-cols-2 gap-6">
							<div className="flex min-h-0 flex-col gap-2">
								<p className="text-lg font-semibold">Acceptance Criteria</p>
								<div className="flex flex-col gap-2 overflow-auto p-0.5">
									{storyData.acceptanceCriteria.map((criterion) => (
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
									{storyData.bugs.map((bug) => (
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
								storyMapItem={story}
								flagged={storyData.ethicsColumn !== null}
								commentType={commentType}
								onFlag={() => {
									updateItem(product, storyMapItems, versions, story.id, {ethicsColumn: `underReview`}).catch(
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
