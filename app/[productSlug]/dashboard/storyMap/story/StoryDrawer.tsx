import {CloseOutlined} from "@ant-design/icons"
import {Input, Button, Checkbox, Drawer, Tag, Typography} from "antd5"
import produce from "immer"
import {useAtom} from "jotai"
import {nanoid} from "nanoid"
import {useState} from "react"

import type {FC} from "react"
import type {Story} from "~/types/db/Products"

import Comments from "~/components/Comments"
import {deleteStory, updateStory} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

export type StoryDrawerProps = {
	story: Story
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({story, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)
	const [activeProduct, setActiveProduct] = useAtom(activeProductAtom)
	const [newAcceptanceCriterion, setNewAcceptanceCriterion] = useState(``)

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
			title={story.name}
			placement="bottom"
			closable={false}
			extra={
				<div className="flex items-center gap-2">
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
								<Tag color="#cf1322">Delete</Tag>
							</button>
						) : (
							<>
								<Tag color="#91d5ff">
									{story.points} point{story.points === 1 ? `` : `s`} total
								</Tag>
								{activeProduct?.effortCost && <Tag color="#a4df74">${activeProduct.effortCost * story.points}</Tag>}
								<button type="button" onClick={() => void setEditMode(true)} className="text-sm text-[#396417]">
									Edit
								</button>
							</>
						)}
					</div>

					<div className="grow" />

					{editMode ? (
						<>
							<Button size="small" onClick={() => void setEditMode(false)}>
								Cancel
							</Button>
							<Button size="small" onClick={() => void setEditMode(false)}>
								Done
							</Button>
						</>
					) : (
						<button type="button" onClick={() => void onClose()}>
							<CloseOutlined />
						</button>
					)}
				</div>
			}
			className="[&_.ant-drawer-header-title]:flex-[0_0_auto] [&_.ant-drawer-extra]:flex-[1_1_0%]"
			headerStyle={{gap: `1rem`}}
			open={isOpen}
			onClose={() => void onClose()}
		>
			<div className="grid h-full grid-cols-2 gap-4">
				{/* Left column */}
				<div className="flex h-full min-h-0 flex-col gap-4">
					<div>
						<Typography.Title level={4}>Story</Typography.Title>
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
						/>
					</div>

					<div className="flex min-h-0 flex-1 flex-col">
						<Typography.Title level={4}>Acceptance Criteria</Typography.Title>
						<div className="flex min-h-0 flex-1 flex-col flex-wrap gap-2 overflow-hidden">
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
				<div className="flex h-full flex-col">
					<Typography.Title level={4}>Comments</Typography.Title>
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
		</Drawer>
	)
}

export default StoryDrawer
