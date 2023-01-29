import {
	BlockOutlined,
	CodeOutlined,
	DeleteFilled,
	DollarOutlined,
	LinkOutlined,
	NumberOutlined,
} from "@ant-design/icons"
import {zodResolver} from "@hookform/resolvers/zod"
import {useQuery} from "@tanstack/react-query"
import {Button, Checkbox, Drawer, Tag, Select, Segmented, Input, Form} from "antd5"
import produce from "immer"
import {useAtom, useAtomValue} from "jotai"
import {nanoid} from "nanoid"
import {useState} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"

import type {FC} from "react"
import type {Story} from "~/types/db/Products"

import {currentVersionAtom} from "../atoms"
import Comments from "~/components/Comments"
import LinkTo from "~/components/LinkTo"
import RhfInput from "~/components/rhf/RhfInput"
import {idSchema} from "~/types"
import {deleteStory, updateStory} from "~/utils/api/mutations"
import {getVersionsByProduct} from "~/utils/api/queries"
import {activeProductAtom} from "~/utils/atoms"
import dollarFormat from "~/utils/dollarFormat"
import {formValidateStatus} from "~/utils/formValidateStatus"

const formSchema = z.object({
	name: z.string(),
	points: z.number(),
	versionId: idSchema,
	designLink: z.string().url(`Invalid URL.`).nullable(),
	branchName: z.string().nullable(),
	pageLink: z.string().url(`Invalid URL.`).nullable(),
})
type FormInputs = z.infer<typeof formSchema>

export type StoryDrawerProps = {
	story: Story
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({story, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)
	const [activeProduct, setActiveProduct] = useAtom(activeProductAtom)
	const [newAcceptanceCriterion, setNewAcceptanceCriterion] = useState(``)
	const currentVersion = useAtomValue(currentVersionAtom)

	const {control, handleSubmit, getFieldState, formState} = useForm<FormInputs>({
		mode: `onChange`,
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: story.name,
			points: story.points,
			versionId: story.versionId,
			designLink: story.designLink,
			branchName: story.branchName,
			pageLink: story.pageLink,
		},
	})

	const onSubmit = handleSubmit((data) => {
		updateStory({storyMapState: activeProduct!.storyMapState, storyId: story.id, data})
		setEditMode(false)
	})

	const {data: versions} = useQuery({
		queryKey: [`all-versions`, activeProduct?.id],
		queryFn: getVersionsByProduct(activeProduct!.id),
		enabled: activeProduct !== undefined,
	})

	const updateLocalStoryDescription = (newDescription: string) => {
		setActiveProduct((activeProduct) =>
			produce(activeProduct, (draft) => {
				const index = draft!.storyMapState.stories.findIndex(({id}) => id === story.id)
				draft!.storyMapState.stories[index]!.description = newDescription
			}),
		)
	}

	const toggleAcceptanceCriterion = (id: string, checked: boolean) => {
		const newAcceptanceCriteria = produce(story.acceptanceCriteria, (draft) => {
			const index = draft.findIndex((criterion) => criterion.id === id)
			draft[index]!.checked = checked
		})
		updateStory({
			storyMapState: activeProduct!.storyMapState,
			storyId: story.id,
			data: {
				acceptanceCriteria: newAcceptanceCriteria,
			},
		})
	}

	const addAcceptanceCriterion = () => {
		updateStory({
			storyMapState: activeProduct!.storyMapState,
			storyId: story.id,
			data: {
				acceptanceCriteria: [...story.acceptanceCriteria, {id: nanoid(), name: newAcceptanceCriterion, checked: false}],
			},
		})
	}

	return (
		<Drawer
			title={
				<div className="flex flex-col gap-1">
					<p>{story.name}</p>
					<div>
						{editMode ? (
							<button
								type="button"
								onClick={async () =>
									void deleteStory({
										storyMapState: activeProduct!.storyMapState,
										storyId: story.id,
									})
								}
							>
								<Tag color="#cf1322" icon={<DeleteFilled />}>
									Delete
								</Tag>
							</button>
						) : (
							<div className="flex gap-4">
								<div>
									<Tag color="#585858" icon={<NumberOutlined />}>
										{story.points} point{story.points === 1 ? `` : `s`}
									</Tag>
									<Tag
										color={typeof activeProduct?.effortCost === `number` ? `#389e0d` : `#f5f5f5`}
										icon={<DollarOutlined />}
										style={
											typeof activeProduct?.effortCost === `number`
												? {}
												: {color: `#d9d9d9`, border: `1px solid currentColor`}
										}
									>
										{dollarFormat((activeProduct?.effortCost ?? 1) * story.points)}
									</Tag>
								</div>
								<div>
									<Tag
										color={story.branchName ? `#9254de` : `#f5f5f5`}
										icon={<CodeOutlined />}
										style={story.branchName ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
									>
										{story.branchName ?? `No branch`}
									</Tag>
									<LinkTo href={story.designLink} openInNewTab>
										<Tag
											color={story.designLink ? `#1677ff` : `#f5f5f5`}
											icon={<BlockOutlined />}
											style={story.designLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
										>
											Design
										</Tag>
									</LinkTo>
									<LinkTo href={story.pageLink} openInNewTab>
										<Tag
											color={story.pageLink ? `#1677ff` : `#f5f5f5`}
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
				<div className="flex items-center gap-2">
					{editMode ? (
						<>
							<Button size="small" onClick={() => void setEditMode(false)}>
								Cancel
							</Button>
							<Button size="small" type="primary" htmlType="submit" form="story-form" className="bg-green-s500">
								Done
							</Button>
						</>
					) : (
						<button type="button" onClick={() => void setEditMode(true)} className="ml-1 text-sm text-[#1677ff]">
							Edit
						</button>
					)}
				</div>
			}
			open={isOpen}
			onClose={() => void onClose()}
		>
			{editMode ? (
				<Form id="story-form" layout="vertical" className="space-y-4" onFinish={onSubmit}>
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
							<Segmented options={[1, 2, 3, 5, 8, 13]} />
						</Form.Item>
						<Form.Item label="Version">
							<Select
								defaultValue={currentVersion.id}
								options={versions?.map((version) => ({label: version.name, value: version.id}))}
							/>
						</Form.Item>
						<Form.Item label="Status">
							<Select />
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
						<div className="max-h-[calc(100%-8rem)] space-y-2">
							<p className="text-xl font-semibold text-[#595959]">Story</p>
							<Input.TextArea
								rows={4}
								value={story.description}
								onChange={async (e) => {
									updateLocalStoryDescription(e.target.value)
									updateStory({
										storyMapState: activeProduct!.storyMapState,
										storyId: story.id,
										data: {
											description: e.target.value,
										},
									})
								}}
								className="max-h-[calc(100%-2.25rem)]"
							/>
						</div>

						<div className="flex min-h-0 flex-1 flex-col gap-2">
							<p className="text-xl font-semibold text-[#595959]">Acceptance Criteria</p>
							<div className="flex min-h-0 flex-1 flex-col flex-wrap gap-2 overflow-x-auto p-0.5">
								{story.acceptanceCriteria.map((criterion) => (
									<Checkbox
										key={criterion.id}
										checked={criterion.checked}
										onChange={(e) => void toggleAcceptanceCriterion(criterion.id, e.target.checked)}
										style={{marginLeft: `0px`}}
									>
										{criterion.name}
									</Checkbox>
								))}
								<form
									onSubmit={(e) => {
										e.preventDefault()
										addAcceptanceCriterion()
										setNewAcceptanceCriterion(``)
									}}
								>
									<Input
										size="small"
										placeholder="Add item"
										value={newAcceptanceCriterion}
										onChange={(e) => void setNewAcceptanceCriterion(e.target.value)}
										className="w-40"
									/>

									<input type="submit" hidden />
								</form>
							</div>
						</div>
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col gap-2">
						<p className="text-xl font-semibold text-[#595959]">Comments</p>
						<div className="relative grow">
							<Comments
								commentList={story.commentIds}
								onCommentListChange={(newCommentList) =>
									void updateStory({
										storyMapState: activeProduct!.storyMapState,
										storyId: story.id,
										data: {
											commentIds: newCommentList,
										},
									})
								}
								flagged={story.ethicsColumn !== null}
								onFlag={() =>
									void updateStory({
										storyMapState: activeProduct!.storyMapState,
										storyId: story.id,
										data: {ethicsColumn: `identified`},
									})
								}
							/>
						</div>
					</div>
				</div>
			)}
		</Drawer>
	)
}

export default StoryDrawer
