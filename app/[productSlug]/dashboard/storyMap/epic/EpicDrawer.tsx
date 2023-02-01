import {DeleteFilled, DollarOutlined, NumberOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Button, Checkbox, Drawer, Form, Input, Tag, Typography} from "antd"
import produce from "immer"
import {useAtom, useAtomValue} from "jotai"
import {useState} from "react"

import type {FC} from "react"
import type {Epic} from "~/types/db/StoryMapStates"

import {storyMapStateAtom} from "../atoms"
import Comments from "~/components/Comments"
import {deleteEpic, updateEpic} from "~/utils/api/mutations"
import {getUser} from "~/utils/api/queries"
import dollarFormat from "~/utils/dollarFormat"
import {objectKeys} from "~/utils/objectMethods"

export type EpicDrawerProps = {
	epic: Epic
	isOpen: boolean
	onClose: () => void
}

const EpicDrawer: FC<EpicDrawerProps> = ({epic, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)
	const activeProduct = useAtomValue(activeProductAtom)
	const [storyMapState, setStoryMapState] = useAtom(storyMapStateAtom)
	const [draftTitle, setDraftTitle] = useState(epic.name)

	const updateLocalEpicDescription = (newDescription: string) => {
		setStoryMapState((cur) =>
			produce(cur, (draft) => {
				const index = draft!.epics.findIndex(({id}) => id === epic.id)
				draft!.epics[index]!.description = newDescription
			}),
		)
	}

	let points = 0
	epic.featureIds.forEach((featureId) => {
		const feature = storyMapState?.features.find((feature) => feature.id === featureId)
		feature?.storyIds.forEach((storyId) => {
			const story = storyMapState?.stories.find((story) => story.id === storyId)
			points += story?.points ?? 0
		})
	})

	const res = useQueries({
		queries: activeProduct
			? objectKeys(activeProduct.members).map((id) => ({
					queryKey: [`user`, id],
					queryFn: getUser(id),
			  }))
			: [],
	})

	return (
		<Drawer
			title={
				<div className="flex flex-col gap-1">
					<p>{epic.name}</p>
					<div>
						{editMode ? (
							<button
								type="button"
								onClick={async () =>
									void deleteEpic({
										storyMapState: storyMapState!,
										epicId: epic.id,
									})
								}
							>
								<Tag color="#cf1322" icon={<DeleteFilled />}>
									Delete
								</Tag>
							</button>
						) : (
							<div>
								<Tag color="#585858" icon={<NumberOutlined />}>
									{points} point{points === 1 ? `` : `s`}
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
									{dollarFormat((activeProduct?.effortCost ?? 1) * points)}
								</Tag>
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
							<Button
								size="small"
								type="primary"
								onClick={() => {
									void updateEpic({
										storyMapState: storyMapState!,
										epicId: epic.id,
										data: {name: draftTitle},
									})
									void setEditMode(false)
								}}
								className="bg-green-s500"
							>
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
				<Form layout="vertical">
					<Form.Item label="Title">
						<Input value={draftTitle} onChange={(e) => void setDraftTitle(e.target.value)} />
					</Form.Item>
				</Form>
			) : (
				<div className="grid h-full grid-cols-2 gap-8">
					{/* Left column */}
					<div className="flex h-full min-h-0 flex-col gap-6">
						<div className="max-h-[calc(100%-8rem)] space-y-2">
							<p className="text-xl font-semibold text-[#595959]">Epic</p>
							<Input.TextArea
								rows={4}
								value={epic.description}
								onChange={async (e) => {
									updateLocalEpicDescription(e.target.value)
									updateEpic({
										storyMapState: storyMapState!,
										epicId: epic.id,
										data: {
											description: e.target.value,
										},
									})
								}}
								className="max-h-[calc(100%-2.25rem)]"
							/>
						</div>

						<div className="flex min-h-0 flex-1 flex-col gap-2">
							<p className="text-xl font-semibold text-[#595959]">Keeper(s)</p>
							<div className="flex min-h-0 flex-1 flex-col flex-wrap gap-2 overflow-x-auto p-0.5">
								{res.map(
									(user) =>
										user.data && (
											<Checkbox
												key={user.data.id}
												checked={epic.keeperIds.includes(user.data.id)}
												onChange={(e) =>
													void updateEpic({
														storyMapState: storyMapState!,
														epicId: epic.id,
														data: {
															keeperIds: e.target.checked
																? [...epic.keeperIds, user.data.id]
																: epic.keeperIds.filter((id) => id !== user.data.id),
														},
													})
												}
											>
												{user.data.name}
											</Checkbox>
										),
								)}
							</div>
						</div>
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col">
						<Typography.Title level={4}>Comments</Typography.Title>
						<div className="relative grow">
							<Comments
								commentList={epic.commentIds}
								onCommentListChange={(newCommentList) =>
									void updateEpic({
										storyMapState: storyMapState!,
										epicId: epic.id,
										data: {
											commentIds: newCommentList,
										},
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

export default EpicDrawer
