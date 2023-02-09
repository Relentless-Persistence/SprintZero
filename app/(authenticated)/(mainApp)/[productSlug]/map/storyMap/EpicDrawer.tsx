import {DeleteFilled, DollarOutlined, NumberOutlined} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Button, Checkbox, Drawer, Form, Input, Tag, Typography} from "antd"
import {doc, getDoc} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {StoryMapMeta} from "./utils/meta"
import type {FC} from "react"

import Comments from "~/components/Comments"
import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import dollarFormat from "~/utils/dollarFormat"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type EpicDrawerProps = {
	meta: StoryMapMeta
	epicId: string
	isOpen: boolean
	onClose: () => void
}

const EpicDrawer: FC<EpicDrawerProps> = ({meta, epicId, isOpen, onClose}) => {
	const [editMode, setEditMode] = useState(false)
	const epic = meta.epics.find((epic) => epic.id === epicId)!
	const [draftTitle, setDraftTitle] = useState(epic.name)
	const [description, setDescription] = useState(epic.description)

	useEffect(() => {
		setDescription(epic.description)
	}, [epic.description])

	let points = 0
	epic.children.forEach((feature) => {
		feature.children.forEach((story) => {
			points += story.points
		})
	})

	const activeProductId = useActiveProductId()
	const [product] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const productMembers = useQueries({
		queries: product
			? Object.keys(product.members).map((userId) => ({
					queryKey: [`user`, userId],
					queryFn: async () => (await getDoc(doc(db, `Users`, userId).withConverter(UserConverter))).data(),
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
								onClick={() => {
									meta.deleteEpic(epic.id).catch(console.error)
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
									color={typeof product?.effortCost === `number` ? `#389e0d` : `#f5f5f5`}
									icon={<DollarOutlined />}
									style={
										typeof product?.effortCost === `number` ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}
									}
								>
									{dollarFormat((product?.effortCost ?? 1) * points)}
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
										.updateEpic(epic.id, {name: draftTitle})
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
					<div className="flex h-full min-h-0 flex-col gap-6">
						<div className="flex max-h-[calc(100%-8rem)] flex-col gap-2">
							<p className="text-xl font-semibold text-gray">Epic</p>
							<Input.TextArea
								rows={4}
								value={description}
								onChange={(e) => {
									setDescription(e.target.value)
									meta
										.updateEpic(epic.id, {
											description: e.target.value,
										})
										.catch(console.error)
								}}
								className="max-h-[calc(100%-2.25rem)]"
							/>
						</div>

						<div className="flex min-h-0 flex-1 flex-col gap-2">
							<p className="text-xl font-semibold text-gray">Keeper(s)</p>
							<div className="flex min-h-0 flex-1 flex-col flex-wrap gap-2 overflow-x-auto p-0.5">
								{productMembers.map(
									(user) =>
										user.data && (
											<Checkbox
												key={user.data.id}
												checked={epic.keeperIds.includes(user.data.id)}
												onChange={(e) => {
													meta
														.updateEpic(epic.id, {
															keeperIds: e.target.checked
																? [...epic.keeperIds, user.data!.id]
																: epic.keeperIds.filter((id) => id !== user.data!.id),
														})
														.catch(console.error)
												}}
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
							<Comments storyMapStateId={meta.id} parentId={epicId} />
						</div>
					</div>
				</div>
			)}
		</Drawer>
	)
}

export default EpicDrawer
