import {CloseOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Button, Checkbox, Drawer, Input, Tag, Typography} from "antd5"
import produce from "immer"
import {useAtom} from "jotai"
import {useState} from "react"

import type {FC} from "react"
import type {Epic} from "~/types/db/Products"

import Comments from "~/components/Comments"
import {deleteEpic, updateEpic} from "~/utils/api/mutations"
import {getUser} from "~/utils/api/queries"
import {activeProductAtom} from "~/utils/atoms"

export type EpicDrawerProps = {
	epic: Epic
	isOpen: boolean
	onClose: () => void
}

const EpicDrawer: FC<EpicDrawerProps> = ({epic, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)
	const [activeProduct, setActiveProduct] = useAtom(activeProductAtom)

	const updateLocalEpicDescription = (newDescription: string) => {
		setActiveProduct((activeProduct) =>
			produce(activeProduct, (draft) => {
				const index = draft!.storyMapState.epics.findIndex(({id}) => id === epic.id)
				draft!.storyMapState.epics[index]!.description = newDescription
			}),
		)
	}

	let points = 0
	epic.featureIds.forEach((featureId) => {
		const feature = activeProduct?.storyMapState.features.find((feature) => feature.id === featureId)
		feature?.storyIds.forEach((storyId) => {
			const story = activeProduct?.storyMapState.stories.find((story) => story.id === storyId)
			points += story?.points ?? 0
		})
	})

	const res = useQueries({
		queries:
			activeProduct?.members.map((member) => ({
				queryKey: [`user`, member.userId],
				queryFn: getUser(member.userId),
			})) ?? [],
	})

	return (
		<Drawer
			title={epic.name}
			placement="bottom"
			closable={false}
			extra={
				<div className="flex items-center gap-2">
					<div>
						{editMode ? (
							<button
								type="button"
								onClick={async () =>
									void deleteEpic({
										storyMapState: activeProduct!.storyMapState,
										epicId: epic.id,
									})
								}
							>
								<Tag color="#cf1322">Delete</Tag>
							</button>
						) : (
							<>
								<Tag color="#91d5ff">
									{points} point{points === 1 ? `` : `s`} total
								</Tag>
								{activeProduct?.effortCost && <Tag color="#a4df74">${activeProduct.effortCost * points}</Tag>}
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
				<div className="space-y-4">
					<div>
						<Typography.Title level={4}>Epic</Typography.Title>
						<Input.TextArea
							rows={4}
							value={epic.description}
							onChange={async (e) => {
								updateLocalEpicDescription(e.target.value)
								updateEpic({
									storyMapState: activeProduct!.storyMapState,
									epicId: epic.id,
									data: {
										description: e.target.value,
									},
								})
							}}
						/>
					</div>

					<div>
						<Typography.Title level={4}>Keeper(s)</Typography.Title>
						{res.map(
							(user) =>
								user.data && (
									<Checkbox
										key={user.data.id}
										checked={epic.keeperIds.includes(user.data.id)}
										onChange={(e) =>
											void updateEpic({
												storyMapState: activeProduct!.storyMapState,
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

				{/* Right column */}
				<div className="flex h-full flex-col">
					<Typography.Title level={4}>Comments</Typography.Title>
					<div className="relative grow">
						<Comments
							commentList={epic.commentIds}
							onCommentListChange={(newCommentList) =>
								void updateEpic({
									storyMapState: activeProduct!.storyMapState,
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
		</Drawer>
	)
}

export default EpicDrawer
