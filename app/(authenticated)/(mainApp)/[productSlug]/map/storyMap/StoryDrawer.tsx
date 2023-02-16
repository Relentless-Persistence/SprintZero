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
import {Button, Checkbox, Drawer, Form, Input, Tag} from "antd"
import clsx from "clsx"
import {doc} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useEffect, useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"
import {useForm} from "react-hook-form"

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
import dollarFormat from "~/utils/dollarFormat"
import {db} from "~/utils/firebase"
import {formValidateStatus} from "~/utils/formValidateStatus"
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
	const [newAcceptanceCriterion, setNewAcceptanceCriterion] = useState(``)
	const story = meta.stories.find((story) => story.id === storyId)!

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
		await meta.updateStory(story.id, data)
		setEditMode(false)
	})

	const toggleAcceptanceCriterion = async (id: string, checked: boolean) => {
		const newAcceptanceCriteria = produce(story.acceptanceCriteria, (draft) => {
			const index = draft.findIndex((criterion) => criterion.id === id)
			draft[index]!.checked = checked
		})
		await meta.updateStory(story.id, {
			acceptanceCriteria: newAcceptanceCriteria,
		})
	}

	const addAcceptanceCriterion = async () => {
		await meta.updateStory(story.id, {
			acceptanceCriteria: [
				...story.acceptanceCriteria,
				{id: nanoid() as Id, name: newAcceptanceCriterion, checked: false},
			],
		})
	}

	return (
		<Drawer
			title={
				<div className="flex h-14 flex-col justify-center gap-1">
					{!editMode && <p>{story.name}</p>}
					<div>
						{editMode ? (
							<Button
								type="primary"
								danger
								onClick={() => {
									meta.deleteStory(story.id).catch(console.error)
								}}
							>
								Delete
							</Button>
						) : (
							<div className="relative">
								<div>
									<Tag color="#585858" icon={<NumberOutlined />}>
										{story.points} point{story.points === 1 ? `` : `s`}
									</Tag>
									<Tag
										color={typeof product?.effortCost === `number` ? `#585858` : `#f5f5f5`}
										icon={<DollarOutlined />}
										className={clsx(
											typeof product?.effortCost !== `number` && `border !border-current !text-[#d9d9d9]`,
										)}
									>
										{dollarFormat((product?.effortCost ?? 0) * story.points)}
									</Tag>
									<Tag color="#585858" icon={<FlagOutlined />}>
										{sprintColumns[story.sprintColumn]}
									</Tag>
								</div>

								<div className="absolute left-96 top-0">
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
						)}
					</div>
				</div>
			}
			placement="bottom"
			closable={false}
			height={500}
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
							<button type="button" onClick={() => setEditMode(true)} className="ml-1 text-sm text-[#1677ff]">
								Edit
							</button>
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
							<p className="text-xl font-semibold text-gray">Story</p>
							<Input.TextArea
								rows={4}
								value={description}
								onChange={(e) => {
									setDescription(e.target.value)
									meta
										.updateStory(story.id, {
											description: e.target.value,
										})
										.catch(console.error)
								}}
								className="max-h-[calc(100%-2.25rem)]"
							/>
						</div>

						<div className="flex min-h-0 flex-1 flex-col gap-2">
							<p className="text-xl font-semibold text-gray">Acceptance Criteria</p>
							<div className="flex min-h-0 flex-1 flex-col flex-wrap gap-2 overflow-x-auto p-0.5">
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
								<form
									onSubmit={(e) => {
										e.preventDefault()
										addAcceptanceCriterion()
											.then(() => {
												setNewAcceptanceCriterion(``)
											})
											.catch(console.error)
									}}
								>
									<Input
										size="small"
										placeholder="Add item"
										value={newAcceptanceCriterion}
										onChange={(e) => setNewAcceptanceCriterion(e.target.value)}
										className="w-40"
									/>

									<input type="submit" hidden />
								</form>
							</div>
						</div>
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col gap-2">
						<p className="text-xl font-semibold text-gray">Comments</p>
						<div className="relative grow">
							<Comments
								storyMapStateId={meta.storyMapStateId}
								parentId={storyId}
								flagged={story.ethicsColumn !== null}
								onFlag={() => {
									meta
										.updateStory(story.id, {
											ethicsColumn: `identified`,
										})
										.catch(console.error)
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
