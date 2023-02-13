import {DeleteFilled, DollarOutlined, NumberOutlined} from "@ant-design/icons"
import {Button, Drawer, Form, Input, Tag, Typography} from "antd"
import {doc} from "firebase/firestore"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {StoryMapMeta} from "./meta"
import type {FC} from "react"
import type {Id} from "~/types"

import Comments from "~/components/Comments"
import {ProductConverter} from "~/types/db/Products"
import dollarFormat from "~/utils/dollarFormat"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type FeatureDrawerProps = {
	meta: StoryMapMeta
	featureId: Id
	isOpen: boolean
	onClose: () => void
}

const FeatureDrawer: FC<FeatureDrawerProps> = ({meta, featureId, isOpen, onClose}) => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const [editMode, setEditMode] = useState(false)
	const feature = meta.features.find((feature) => feature.id === featureId)!
	const [draftTitle, setDraftTitle] = useState(feature.name)
	const [description, setDescription] = useState(feature.description)

	let points = 0
	feature.childrenIds
		.map((id) => meta.stories.find((story) => story.id === id)!)
		.forEach((story) => {
			points += story.points
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
								onClick={() => {
									meta.deleteFeature(feature.id).catch(console.error)
								}}
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
							<Button size="small" onClick={() => setEditMode(false)}>
								Cancel
							</Button>
							<Button
								size="small"
								type="primary"
								onClick={() => {
									meta
										.updateFeature(featureId, {name: draftTitle})
										.then(() => {
											setEditMode(false)
										})
										.catch(console.error)
								}}
								className="bg-green"
							>
								Done
							</Button>
						</>
					) : (
						<button type="button" onClick={() => setEditMode(true)} className="ml-1 text-sm text-[#1677ff]">
							Edit
						</button>
					)}
				</div>
			}
			open={isOpen}
			onClose={() => onClose()}
		>
			{editMode ? (
				<Form layout="vertical">
					<Form.Item label="Title">
						<Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
					</Form.Item>
				</Form>
			) : (
				<div className="grid h-full grid-cols-2 gap-8">
					{/* Left column */}
					<div className="flex h-full min-h-0 flex-col gap-4">
						<div className="flex h-[calc(100%-4rem)] flex-col gap-2">
							<p className="text-xl font-semibold text-gray">Feature</p>
							<Input.TextArea
								rows={4}
								value={description}
								onChange={(e) => {
									setDescription(e.target.value)
									meta
										.updateFeature(featureId, {
											description: e.target.value,
										})
										.catch(console.error)
								}}
								className="max-h-[calc(100%-2.25rem)]"
							/>
						</div>
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col">
						<Typography.Title level={4}>Comments</Typography.Title>
						<div className="relative grow">
							<Comments storyMapStateId={meta.id} parentId={feature.id} />
						</div>
					</div>
				</div>
			)}
		</Drawer>
	)
}

export default FeatureDrawer
