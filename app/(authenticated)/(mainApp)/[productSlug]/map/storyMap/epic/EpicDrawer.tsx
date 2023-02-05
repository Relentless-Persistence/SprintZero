import {DeleteFilled, DollarOutlined, NumberOutlined} from "@ant-design/icons"
import {Button, Checkbox, Drawer, Form, Input, Tag, Typography} from "antd"
import {collection, doc, documentId, query, where} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useCollectionData, useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import Comments from "~/components/Comments"
import {ProductConverter, Products} from "~/types/db/Products"
import {UserConverter, Users} from "~/types/db/Users"
import dollarFormat from "~/utils/dollarFormat"
import {db} from "~/utils/firebase"
import {deleteEpic, updateEpic} from "~/utils/mutations"
import {objectKeys} from "~/utils/objectMethods"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type EpicDrawerProps = {
	storyMapState: WithDocumentData<StoryMapState>
	epicId: string
	isOpen: boolean
	onClose: () => void
}

const EpicDrawer: FC<EpicDrawerProps> = ({storyMapState, epicId, isOpen, onClose}) => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))
	const [editMode, setEditMode] = useState(false)
	const epic = storyMapState.epics.find((epic) => epic.id === epicId)!
	const [draftTitle, setDraftTitle] = useState(epic.name)
	const [description, setDescription] = useState(epic.description)

	useEffect(() => {
		setDescription(epic.description)
	}, [epic.description])

	let points = 0
	epic.featureIds.forEach((featureId) => {
		const feature = storyMapState.features.find((feature) => feature.id === featureId)
		feature?.storyIds.forEach((storyId) => {
			const story = storyMapState.stories.find((story) => story.id === storyId)
			points += story?.points ?? 0
		})
	})

	const [productMembers] = useCollectionData(
		activeProduct
			? query(collection(db, Users._), where(documentId(), `in`, objectKeys(activeProduct.members))).withConverter(
					UserConverter,
			  )
			: undefined,
	)

	return (
		<Drawer
			title={
				<div className="flex flex-col gap-1">
					<p>{epic.name}</p>
					<div>
						{editMode ? (
							<button
								type="button"
								onClick={() =>
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
								className="bg-green"
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
							<p className="text-gray text-xl font-semibold">Epic</p>
							<Input.TextArea
								rows={4}
								value={description}
								onChange={(e) => {
									setDescription(e.target.value)
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
							<p className="text-gray text-xl font-semibold">Keeper(s)</p>
							<div className="flex min-h-0 flex-1 flex-col flex-wrap gap-2 overflow-x-auto p-0.5">
								{productMembers?.map((user) => (
									<Checkbox
										key={user.id}
										checked={epic.keeperIds.includes(user.id)}
										onChange={(e) =>
											void updateEpic({
												storyMapState: storyMapState!,
												epicId: epic.id,
												data: {
													keeperIds: e.target.checked
														? [...epic.keeperIds, user.id]
														: epic.keeperIds.filter((id) => id !== user.id),
												},
											})
										}
									>
										{user.name}
									</Checkbox>
								))}
							</div>
						</div>
					</div>

					{/* Right column */}
					<div className="flex h-full flex-col">
						<Typography.Title level={4}>Comments</Typography.Title>
						<div className="relative grow">
							<Comments storyMapStateId={storyMapState.id} parentId={epicId} />
						</div>
					</div>
				</div>
			)}
		</Drawer>
	)
}

export default EpicDrawer
