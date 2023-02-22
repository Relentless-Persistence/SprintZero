import {
	BlockOutlined,
	CloseOutlined,
	CodeOutlined,
	DollarOutlined,
	FlagOutlined,
	LinkOutlined,
	NumberOutlined,
} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {Button, Checkbox, Drawer, Form, Input, Segmented, Tag} from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import {Timestamp, doc} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useEffect, useState} from "react"
import {useDocument, useDocumentData} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"
import {useInterval} from "react-use"

import type {StoryMapMeta} from "./meta"
import type {FC} from "react"
import type {z} from "zod"
import type {Id} from "~/types"

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

const formSchema = StorySchema.pick({
	branchName: true,
	designLink: true,
	name: true,
	pageLink: true,
	points: true,
	sprintColumn: true,
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
		if (story.updatedAt instanceof Timestamp) setLastModifiedText(dayjs(story.updatedAt.toMillis()).fromNow())
	}, 1000)

	const [lastModifiedUser] = useDocument(doc(db, `Users`, story.updatedAtUserId).withConverter(UserConverter))

	const [description, setDescription] = useState(story.description)
	useEffect(() => {
		setDescription(story.description)
	}, [story.description])

	const activeProductId = useActiveProductId()
	const [product] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const {control, handleSubmit, getFieldState, formState} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			branchName: story.branchName,
			designLink: story.designLink,
			name: story.name,
			pageLink: story.pageLink,
			points: story.points,
			sprintColumn: story.sprintColumn,
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

	return (
		<Drawer
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
						<div className="flex items-end gap-2">
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
								<p className="text-sm font-normal text-gray">
									Last modified {lastModifiedText} by {lastModifiedUser.data().name}
								</p>
							)}
						</div>
						<div>
							<div className="relative">
								<Tag color="#585858" icon={<NumberOutlined />}>
									{story.points} point{story.points === 1 ? `` : `s`}
								</Tag>
								<Tag
									color={typeof product?.effortCost === `number` ? `#585858` : `#f5f5f5`}
									icon={<DollarOutlined />}
									className={clsx(typeof product?.effortCost !== `number` && `border !border-current !text-[#d9d9d9]`)}
								>
									{dollarFormat((product?.effortCost ?? 0) * story.points)}
								</Tag>
								<Tag color="#585858" icon={<FlagOutlined />}>
									{sprintColumns[story.sprintColumn]}
								</Tag>

								<div className="absolute left-1/2 top-0 -translate-x-1/2">
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
			placement="bottom"
			closable={false}
			height={434}
			extra={
				<div className="flex items-center gap-4">
					{editMode ? (
						<>
							<Button onClick={() => setEditMode(false)}>Cancel</Button>
							<Button type="primary" htmlType="submit" form="story-form" className="bg-green">
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
			open={isOpen}
			onClose={() => onClose()}
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
						<Form.Item
							label="Title"
							hasFeedback
							validateStatus={formValidateStatus(getFieldState(`name`, formState))}
							className="grow"
						>
							<RhfInput control={control} name="name" />
						</Form.Item>
						<Form.Item
							label="Effort Estimate"
							hasFeedback
							validateStatus={formValidateStatus(getFieldState(`points`, formState))}
						>
							<RhfSegmented control={control} name="points" options={[1, 2, 3, 5, 8, 13]} />
						</Form.Item>
						<Form.Item label="Version" className="shrink-0 basis-20">
							<RhfSelect
								control={control}
								name="versionId"
								options={meta.allVersions.docs.map((version) => ({label: version.data().name, value: version.id}))}
							/>
						</Form.Item>
						<Form.Item label="Status" className="shrink-0 basis-56">
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
				<div className="grid h-full grid-cols-2 gap-8">
					{/* Left column */}
					<div className="flex h-full min-h-0 flex-col gap-6">
						<div className="flex max-h-[calc(100%-8rem)] flex-col gap-2">
							<p className="text-lg font-medium text-gray">Story</p>
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
								className="max-h-[calc(100%-2.25rem)]"
							/>
						</div>

						<div className="grid min-h-0 grow basis-0 grid-cols-2 gap-8">
							<div className="flex min-h-0 flex-col gap-2">
								<p className="text-lg font-medium text-gray">Acceptance Criteria</p>
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
								<p className="text-lg font-medium text-gray">Bugs</p>
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
							<p className="text-lg font-medium text-gray">Comments</p>
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
									updateItem(
										meta.storyMapState,
										story.id,
										{
											ethicsColumn: `identified`,
										},
										meta.allVersions,
									).catch(console.error)
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
