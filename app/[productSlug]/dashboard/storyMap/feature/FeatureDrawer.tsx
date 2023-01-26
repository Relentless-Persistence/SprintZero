import {CloseOutlined} from "@ant-design/icons"
import {Button, Drawer, Input, Tag, Typography} from "antd5"
import produce from "immer"
import {useAtom} from "jotai"
import {useState} from "react"

import type {FC} from "react"
import type {Feature} from "~/types/db/Products"

import Comments from "~/components/Comments"
import {deleteFeature, updateFeature} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

export type FeatureDrawerProps = {
	feature: Feature
	isOpen: boolean
	onClose: () => void
}

const FeatureDrawer: FC<FeatureDrawerProps> = ({feature, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)
	const [activeProduct, setActiveProduct] = useAtom(activeProductAtom)

	const updateLocalFeatureDescription = (newDescription: string) => {
		setActiveProduct((activeProduct) =>
			produce(activeProduct, (draft) => {
				const index = draft!.storyMapState.features.findIndex(({id}) => id === feature.id)
				draft!.storyMapState.features[index]!.description = newDescription
			}),
		)
	}

	let points = 0
	feature.storyIds.forEach((storyId) => {
		const story = activeProduct?.storyMapState.stories.find((story) => story.id === storyId)
		points += story?.points ?? 0
	})

	return (
		<Drawer
			title={feature.name}
			placement="bottom"
			closable={false}
			extra={
				<div className="flex items-center gap-2">
					<div>
						{editMode ? (
							<button
								type="button"
								onClick={async () =>
									void deleteFeature({
										storyMapState: activeProduct!.storyMapState,
										featureId: feature.id,
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
						<Typography.Title level={4}>Feature</Typography.Title>
						<Input.TextArea
							rows={4}
							value={feature.description}
							onChange={async (e) => {
								updateLocalFeatureDescription(e.target.value)
								updateFeature({
									storyMapState: activeProduct!.storyMapState,
									featureId: feature.id,
									data: {
										description: e.target.value,
									},
								})
							}}
						/>
					</div>
				</div>

				{/* Right column */}
				<div className="flex h-full flex-col">
					<Typography.Title level={4}>Comments</Typography.Title>
					<div className="relative grow">
						<Comments
							commentList={feature.commentIds}
							onCommentListChange={(newCommentList) =>
								void updateFeature({
									storyMapState: activeProduct!.storyMapState,
									featureId: feature.id,
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

export default FeatureDrawer
