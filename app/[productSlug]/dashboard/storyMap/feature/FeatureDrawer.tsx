import {DeleteFilled, DollarOutlined, NumberOutlined} from "@ant-design/icons"
import {Button, Drawer, Form, Input, Tag, Typography} from "antd5"
import produce from "immer"
import {useAtom, useAtomValue} from "jotai"
import {useState} from "react"

import type {FC} from "react"
import type {Feature} from "~/types/db/StoryMapStates"

import {storyMapStateAtom} from "../atoms"
import Comments from "~/components/Comments"
import {deleteFeature, updateFeature} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"
import dollarFormat from "~/utils/dollarFormat"

export type FeatureDrawerProps = {
	feature: Feature
	isOpen: boolean
	onClose: () => void
}

const FeatureDrawer: FC<FeatureDrawerProps> = ({feature, isOpen, onClose}) => {
	const activeProduct = useAtomValue(activeProductAtom)
	const [storyMapState, setStoryMapState] = useAtom(storyMapStateAtom)
	const [editMode, setEditMode] = useState(false)
	const [draftTitle, setDraftTitle] = useState(feature.name)

	const updateLocalFeatureDescription = (newDescription: string) => {
		setStoryMapState((cur) =>
			produce(cur, (draft) => {
				const index = draft!.features.findIndex(({id}) => id === feature.id)
				draft!.features[index]!.description = newDescription
			}),
		)
	}

	let points = 0
	feature.storyIds.forEach((storyId) => {
		const story = storyMapState?.stories.find((story) => story.id === storyId)
		points += story?.points ?? 0
	})

	return (
		<Drawer
			title={
				<div className="flex flex-col gap-1">
					<p>{feature.name}</p>
					<div>
						{editMode ? (
							<button
								type="button"
								onClick={async () =>
									void deleteFeature({
										storyMapState: storyMapState!,
										featureId: feature.id,
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
									void updateFeature({
										storyMapState: storyMapState!,
										featureId: feature.id,
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
					<div className="h-full min-h-0 space-y-4">
						<div className="h-[calc(100%-4rem)] space-y-2">
							<p className="text-xl font-semibold text-[#595959]">Feature</p>
							<Input.TextArea
								rows={4}
								value={feature.description}
								onChange={async (e) => {
									updateLocalFeatureDescription(e.target.value)
									updateFeature({
										storyMapState: storyMapState!,
										featureId: feature.id,
										data: {
											description: e.target.value,
										},
									})
								}}
								className="max-h-[calc(100%-2.25rem)]"
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
										storyMapState: storyMapState!,
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
			)}
		</Drawer>
	)
}

export default FeatureDrawer
