"use client"

import {
	CheckOutlined,
	CloseOutlined,
	EditOutlined,
	MenuOutlined,
	PlusOutlined,
	RedoOutlined,
	UndoOutlined,
} from "@ant-design/icons"
import {FloatButton, Tooltip} from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import {
	Timestamp,
	collection,
	doc,
	getDocs,
	orderBy,
	query,
	runTransaction,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore"
import {motion} from "framer-motion"
import produce from "immer"
import {useRef, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {HistoryItem} from "~/types/db/Products/StoryMapHistories/HistoryItems"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {AllVersions} from "~/utils/storyMap"

import StoryMap from "./StoryMap"
import StoryMapHeader from "./StoryMapHeader"
import VersionList from "./VersionList"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapHistoryConverter} from "~/types/db/Products/StoryMapHistories"
import {HistoryItemConverter} from "~/types/db/Products/StoryMapHistories/HistoryItems"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"
import {VersionConverter} from "~/types/db/Products/Versions"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {db} from "~/utils/firebase"
import {addHistoryEntry, deleteItem} from "~/utils/storyMap"
import {useActiveProductId} from "~/utils/useActiveProductId"

const StoryMapClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [product, , productError] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [storyMapItems, , storyMapItemsError] = useCollection(
		collection(db, `Products`, activeProductId, `StoryMapItems`).withConverter(StoryMapItemConverter),
	)
	const [versions, , versionsError] = useCollection(
		collection(db, `Products`, activeProductId, `Versions`).withConverter(VersionConverter),
	)
	const [histories, , historiesError] = useCollection(
		query(
			collection(db, `Products`, activeProductId, `StoryMapHistories`).withConverter(StoryMapHistoryConverter),
			orderBy(`timestamp`, `desc`),
		),
	)
	conditionalThrow(productError, storyMapItemsError, versionsError, historiesError)

	const [currentVersionId, setCurrentVersionId] = useState<string | typeof AllVersions | undefined>(undefined)
	const [newVesionInputValue, setNewVesionInputValue] = useState<string | undefined>(undefined)

	const [editMode, setEditMode] = useState(false)
	const [itemsToBeDeleted, setItemsToBeDeleted] = useState<string[]>([])
	const [versionsToBeDeleted, setVersionsToBeDeleted] = useState<string[]>([])
	const [isToolbeltOpen, setIsToolbeltOpen] = useState(false)

	const lastHistory =
		product?.exists() &&
		histories?.docs.find(
			(history) => history.data().future === false && history.id !== product.data().storyMapCurrentHistoryId,
		)
	const currentHistory =
		product?.exists() && histories?.docs.find((history) => history.id === product.data().storyMapCurrentHistoryId)
	const nextHistory = histories?.docs.findLast((history) => history.data().future === true)

	const undo = async () => {
		if (!histories || !lastHistory || !currentHistory) return

		await runTransaction(db, async (transaction) => {
			const lastHistoryItems = await getDocs(
				collection(db, `Products`, activeProductId, `StoryMapHistories`, lastHistory.id, `HistoryItems`).withConverter(
					HistoryItemConverter,
				),
			)

			lastHistoryItems.docs.forEach((historyItem) => {
				const dataWithoutNull = produce(historyItem.data(), (draft) => {
					for (const key in draft) {
						if (draft[key as keyof HistoryItem] === null) delete draft[key as keyof HistoryItem]
					}
				}) as StoryMapItem
				transaction.update(
					doc(db, `Products`, activeProductId, `StoryMapItems`, historyItem.id).withConverter(StoryMapItemConverter),
					{
						...dataWithoutNull,
						updatedAt: serverTimestamp(),
					},
				)
			})

			transaction.update(currentHistory.ref, {
				future: true,
			})
			transaction.update(product.ref, {
				storyMapCurrentHistoryId: lastHistory.id,
			})
		})
	}

	const redo = async () => {
		if (!histories || !nextHistory || !product) return

		await runTransaction(db, async (transaction) => {
			const nextHistoryItems = await getDocs(
				collection(db, `Products`, activeProductId, `StoryMapHistories`, nextHistory.id, `HistoryItems`).withConverter(
					HistoryItemConverter,
				),
			)

			nextHistoryItems.docs.forEach((historyItem) => {
				const dataWithoutNull = produce(historyItem.data(), (draft) => {
					for (const key in draft) {
						if (draft[key as keyof HistoryItem] === null) delete draft[key as keyof HistoryItem]
					}
				}) as StoryMapItem
				transaction.update(
					doc(db, `Products`, activeProductId, `StoryMapItems`, historyItem.id).withConverter(StoryMapItemConverter),
					{
						...dataWithoutNull,
						updatedAt: serverTimestamp(),
					},
				)
			})

			transaction.update(nextHistory.ref, {
				future: false,
			})
			transaction.update(product.ref, {
				storyMapCurrentHistoryId: nextHistory.id,
			})
		})
	}

	const canRedo = histories?.docs.findLast((history) => history.data().future === true)
	const canUndo =
		product?.exists() &&
		histories?.docs.find(
			(history) => history.data().future === false && history.id !== product.data().storyMapCurrentHistoryId,
		)

	const scrollContainerRef = useRef<HTMLDivElement | null>(null)

	let lastUpdated: Timestamp | null = null
	if (product?.exists() && product.data().storyMapUpdatedAt instanceof Timestamp)
		lastUpdated = product.data().storyMapUpdatedAt

	return (
		<div className="grid h-full grid-cols-[1fr_6rem]">
			<div className="relative flex flex-col gap-8">
				{currentVersionId && (
					<StoryMapHeader
						versionName={versions?.docs.find((version) => version.id === currentVersionId)?.data().name}
						lastUpdated={lastUpdated ? dayjs(lastUpdated.toMillis()) : undefined}
					/>
				)}

				<div className="relative w-full grow">
					<motion.div
						layoutScroll
						className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2"
						ref={scrollContainerRef}
					>
						{storyMapItems && currentVersionId !== undefined && versions && (
							<StoryMap
								storyMapItems={storyMapItems}
								allVersions={versions}
								currentVersionId={currentVersionId}
								editMode={editMode}
								itemsToBeDeleted={itemsToBeDeleted}
								setItemsToBeDeleted={setItemsToBeDeleted}
								onScroll={(amt) => {
									if (!scrollContainerRef.current) return
									scrollContainerRef.current.scrollLeft += amt
								}}
							/>
						)}
					</motion.div>
				</div>

				{editMode ? (
					<FloatButton.Group key="edit" className="absolute right-12 bottom-8">
						<Tooltip placement="left" title="Cancel">
							<FloatButton
								icon={<CloseOutlined />}
								onClick={() => {
									setEditMode(false)
									setItemsToBeDeleted([])
									setVersionsToBeDeleted([])
									setIsToolbeltOpen(false)
								}}
							/>
						</Tooltip>
						<Tooltip placement="left" title="Save">
							<FloatButton
								icon={<CheckOutlined />}
								type="primary"
								onClick={() => {
									if (!storyMapItems) return
									Promise.all([
										itemsToBeDeleted.map((id) => {
											if (!product?.exists()) return
											return deleteItem(product, storyMapItems, id)
										}),
										versionsToBeDeleted.map((id) =>
											updateDoc(
												doc(db, `Products`, activeProductId, `StoryMapVersions`, id).withConverter(VersionConverter),
												{
													deleted: true,
												},
											),
										),
										(() => {
											if (!product?.exists()) return
											return addHistoryEntry(product, storyMapItems)
										})(),
									])
										.then(() => {
											setEditMode(false)
											setIsToolbeltOpen(false)
										})
										.catch(console.error)
								}}
							/>
						</Tooltip>
					</FloatButton.Group>
				) : (
					<FloatButton.Group
						key="toolbelt"
						trigger="click"
						open={isToolbeltOpen}
						icon={<MenuOutlined />}
						onOpenChange={(open) => setIsToolbeltOpen(open)}
						className="absolute right-12 bottom-8"
					>
						<Tooltip placement="left" title="Redo">
							<FloatButton
								icon={<RedoOutlined className={clsx(`transition-colors`, !canRedo && `text-textTertiary`)} />}
								className={clsx(!canRedo && `cursor-default`)}
								onClick={() => {
									redo().catch(console.error)
								}}
							/>
						</Tooltip>
						<Tooltip placement="left" title="Undo">
							<FloatButton
								icon={<UndoOutlined className={clsx(`transition-colors`, !canUndo && `text-textTertiary`)} />}
								className={clsx(!canUndo && `cursor-default`)}
								onClick={() => {
									undo().catch(console.error)
								}}
							/>
						</Tooltip>
						<Tooltip placement="left" title="Add Release">
							<FloatButton
								icon={<PlusOutlined />}
								onClick={() => {
									setNewVesionInputValue(``)
									setIsToolbeltOpen(false)
								}}
							/>
						</Tooltip>
						<Tooltip placement="left" title="Edit">
							<FloatButton icon={<EditOutlined />} onClick={() => setEditMode(true)} />
						</Tooltip>
					</FloatButton.Group>
				)}
			</div>

			{storyMapItems && versions && product?.exists() && (
				<VersionList
					product={product}
					allVersions={versions}
					currentVersionId={currentVersionId}
					setCurrentVersionId={setCurrentVersionId}
					newVersionInputValue={newVesionInputValue}
					setNewVersionInputValue={setNewVesionInputValue}
					storyMapItems={storyMapItems}
					editMode={editMode}
					setItemsToBeDeleted={setItemsToBeDeleted}
					versionsToBeDeleted={versionsToBeDeleted}
					setVersionsToBeDeleted={setVersionsToBeDeleted}
				/>
			)}
		</div>
	)
}

export default StoryMapClientPage
