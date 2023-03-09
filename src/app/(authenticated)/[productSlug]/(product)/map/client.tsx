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
	writeBatch,
} from "firebase/firestore"
import {motion} from "framer-motion"
import produce from "immer"
import {nanoid} from "nanoid"
import {useEffect, useRef, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {HistoryItem} from "~/types/db/Products/StoryMapHistories/HistoryItems"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {AllVersions} from "~/utils/storyMap"

import StoryMap from "./StoryMap"
import {StoryMapContext} from "./StoryMapContext"
import StoryMapHeader from "./StoryMapHeader"
import VersionList from "./VersionList"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapHistoryConverter} from "~/types/db/Products/StoryMapHistories"
import {HistoryItemConverter} from "~/types/db/Products/StoryMapHistories/HistoryItems"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"
import {VersionConverter} from "~/types/db/Products/Versions"
import {conditionalThrow} from "~/utils/conditionalThrow"
import {db} from "~/utils/firebase"
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
	const [newVersionInputValue, setNewVersionInputValue] = useState<string | undefined>(undefined)

	useEffect(() => {
		if (currentVersionId === undefined && versions?.docs[0]) setCurrentVersionId(versions.docs[0].id)
	}, [currentVersionId, setCurrentVersionId, versions?.docs])

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
			const currentHistoryItems = await getDocs(
				collection(
					db,
					`Products`,
					activeProductId,
					`StoryMapHistories`,
					currentHistory.id,
					`HistoryItems`,
				).withConverter(HistoryItemConverter),
			)
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

			const itemsToDelete = currentHistoryItems.docs
				.filter((item) => !item.data().deleted)
				.filter(
					(currentHistoryItem) =>
						!lastHistoryItems.docs
							.filter((item) => !item.data().deleted)
							.some((item) => item.id === currentHistoryItem.id),
				)
			itemsToDelete.forEach((item) => {
				transaction.update(
					doc(db, `Products`, activeProductId, `StoryMapItems`, item.id).withConverter(StoryMapItemConverter),
					{
						deleted: true,
						updatedAt: Timestamp.now(),
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

	const deleteItems = async () => {
		if (!storyMapItems || !versions || !product || itemsToBeDeleted.length === 0) return
		const batch = writeBatch(db)

		itemsToBeDeleted.forEach((id) => {
			batch.update(doc(product.ref, `StoryMapItems`, id).withConverter(StoryMapItemConverter), {
				deleted: true,
			})
		})
		versionsToBeDeleted.forEach((id) => {
			batch.update(doc(db, `Products`, activeProductId, `StoryMapVersions`, id).withConverter(VersionConverter), {
				deleted: true,
			})
		})

		// Add a story map history entry
		const historyId = nanoid()
		batch.set(
			doc(db, `Products`, activeProductId, `StoryMapHistories`, historyId).withConverter(StoryMapHistoryConverter),
			{
				future: false,
				timestamp: serverTimestamp(),
			},
		)
		storyMapItems.forEach((item) => {
			batch.set(
				doc(product.ref, `StoryMapHistories`, historyId, `HistoryItems`, item.id).withConverter(HistoryItemConverter),
				item.data(),
			)
		})
		batch.update(product.ref, {
			storyMapCurrentHistoryId: historyId,
		})

		await batch.commit()
		setEditMode(false)
	}

	if (!product?.exists() || !storyMapItems || !versions || currentVersionId === undefined) return null
	return (
		<StoryMapContext.Provider
			value={{
				product,
				storyMapItems,
				versions,
				editMode,
				currentVersionId,
				setCurrentVersionId,
				newVersionInputValue,
				setNewVersionInputValue,
				itemsToBeDeleted,
				setItemsToBeDeleted,
				versionsToBeDeleted,
				setVersionsToBeDeleted,
			}}
		>
			<div className="grid h-full grid-cols-[1fr_6rem]">
				<div className="relative flex flex-col gap-8">
					{currentVersionId && (
						<StoryMapHeader
							versionName={versions.docs.find((version) => version.id === currentVersionId)?.data().name}
							lastUpdated={lastUpdated ? dayjs(lastUpdated.toMillis()) : undefined}
						/>
					)}

					<div className="relative w-full grow">
						<motion.div
							layoutScroll
							className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2"
							ref={scrollContainerRef}
						>
							<StoryMap
								onScroll={(amt) => {
									if (!scrollContainerRef.current) return
									scrollContainerRef.current.scrollLeft += amt
								}}
							/>
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
									}}
								/>
							</Tooltip>
							<Tooltip placement="left" title="Save">
								<FloatButton
									icon={<CheckOutlined />}
									type="primary"
									onClick={() => {
										deleteItems().catch(console.error)
									}}
								/>
							</Tooltip>
						</FloatButton.Group>
					) : (
						<FloatButton.Group
							key="toolbelt"
							trigger="click"
							open={isToolbeltOpen}
							onOpenChange={(open) =>
								// FloatButton.Group seems to perform a state update at the same time it calls this, so I need to wait a
								// bit for the state to update before I can set my own state.
								setTimeout(() => {
									setIsToolbeltOpen(open)
								}, 0)
							}
							icon={<MenuOutlined />}
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
										setNewVersionInputValue(``)
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

				<VersionList />
			</div>
		</StoryMapContext.Provider>
	)
}

export default StoryMapClientPage
