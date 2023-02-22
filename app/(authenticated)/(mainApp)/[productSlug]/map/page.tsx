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
	deleteDoc,
	doc,
	orderBy,
	query,
	serverTimestamp,
	where,
	writeBatch,
} from "firebase/firestore"
import {motion} from "framer-motion"
import {useRef, useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./StoryMapHeader"
import VersionList from "./VersionList"
import {HistoryConverter, HistorySchema} from "~/types/db/Histories"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
import {deleteItem} from "~/utils/storyMap"
import {useActiveProductId} from "~/utils/useActiveProductId"

const StoryMapPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocument(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const [storyMapStates] = useCollection(
		query(collection(db, `StoryMapStates`), where(`productId`, `==`, activeProductId)).withConverter(
			StoryMapStateConverter,
		),
	)
	const storyMapState = storyMapStates?.docs[0]

	const [currentVersionId, setCurrentVersionId] = useState<Id | `__ALL_VERSIONS__` | undefined>(undefined)
	const [newVesionInputValue, setNewVesionInputValue] = useState<string | undefined>(undefined)

	const [versions] = useCollection(
		storyMapState
			? collection(db, `StoryMapStates`, storyMapState.id, `Versions`).withConverter(VersionConverter)
			: undefined,
	)

	const [editMode, setEditMode] = useState(false)
	const [itemsToBeDeleted, setItemsToBeDeleted] = useState<Id[]>([])
	const [versionsToBeDeleted, setVersionsToBeDeleted] = useState<Id[]>([])

	const [histories] = useCollection(
		storyMapState?.exists()
			? query(
					collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
					orderBy(`timestamp`, `desc`),
			  )
			: undefined,
	)

	const redo = async () => {
		if (!storyMapState?.exists() || !histories) return
		const nextHistory = histories.docs.findLast((history) => history.data().future === true)
		if (!nextHistory) return

		const newItems: StoryMapState[`items`] = {}
		for (const [id, value] of Object.entries(nextHistory.data().items)) {
			newItems[id as Id] = {
				...storyMapState.data().items[id as Id],
				...HistorySchema.shape.items.element.parse(value),
			} as Epic | Feature | Story
		}

		const batch = writeBatch(db)
		batch.update(storyMapState.ref, {
			currentHistoryId: nextHistory.id as Id,
			items: newItems,
			updatedAt: serverTimestamp(),
		})
		batch.update(nextHistory.ref, {
			future: false,
		})
		await batch.commit()
	}

	const undo = async () => {
		if (!storyMapState?.exists() || !histories) return
		const lastHistory = histories.docs.find(
			(history) => history.data().future === false && history.id !== storyMapState.data().currentHistoryId,
		)
		if (!lastHistory) return

		const newItems: StoryMapState[`items`] = {}
		for (const [id, value] of Object.entries(lastHistory.data().items)) {
			newItems[id as Id] = {
				...storyMapState.data().items[id as Id],
				...HistorySchema.shape.items.element.parse(value),
			} as Epic | Feature | Story
		}

		const batch = writeBatch(db)
		batch.update(storyMapState.ref, {
			currentHistoryId: lastHistory.id as Id,
			items: newItems,
			updatedAt: serverTimestamp(),
		})
		const currentHistory = histories.docs.find((history) => history.id === storyMapState.data().currentHistoryId)!
		batch.update(currentHistory.ref, {
			future: true,
		})
		await batch.commit()
	}

	const canRedo = histories?.docs.findLast((history) => history.data().future === true)
	const canUndo = histories?.docs.find(
		(history) => history.data().future === false && history.id !== storyMapState?.data()?.currentHistoryId,
	)

	const scrollContainerRef = useRef<HTMLDivElement | null>(null)

	let lastUpdated: Timestamp | undefined = undefined
	if (storyMapState?.data().updatedAt instanceof Timestamp) lastUpdated = storyMapState.data().updatedAt as Timestamp
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
						{activeProduct?.exists() && storyMapState?.exists() && currentVersionId !== undefined && versions && (
							<StoryMap
								storyMapState={storyMapState}
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
					<FloatButton.Group className="absolute right-12 bottom-8">
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
									setEditMode(false)
									itemsToBeDeleted.forEach((id) => {
										deleteItem(storyMapState!, id).catch(console.error)
									})
									versionsToBeDeleted.forEach((id) => {
										deleteDoc(doc(db, `StoryMapStates`, storyMapState!.id, `Versions`, id)).catch(console.error)
									})
								}}
							/>
						</Tooltip>
					</FloatButton.Group>
				) : (
					<FloatButton.Group trigger="click" icon={<MenuOutlined />} className="absolute right-12 bottom-8">
						<Tooltip placement="left" title="Redo">
							<FloatButton
								icon={<RedoOutlined className={clsx(`transition-colors`, !canRedo && `text-laurel`)} />}
								className={clsx(!canRedo && `cursor-default`)}
								onClick={() => {
									redo().catch(console.error)
								}}
							/>
						</Tooltip>
						<Tooltip placement="left" title="Undo">
							<FloatButton
								icon={<UndoOutlined className={clsx(`transition-colors`, !canUndo && `text-laurel`)} />}
								className={clsx(!canUndo && `cursor-default`)}
								onClick={() => {
									undo().catch(console.error)
								}}
							/>
						</Tooltip>
						<Tooltip placement="left" title="Add Release">
							<FloatButton icon={<PlusOutlined />} onClick={() => setNewVesionInputValue(``)} />
						</Tooltip>
						<Tooltip placement="left" title="Edit">
							<FloatButton icon={<EditOutlined />} onClick={() => setEditMode(true)} />
						</Tooltip>
					</FloatButton.Group>
				)}
			</div>

			{activeProduct?.exists() && storyMapState && versions && (
				<VersionList
					allVersions={versions}
					currentVersionId={currentVersionId}
					setCurrentVersionId={setCurrentVersionId}
					newVersionInputValue={newVesionInputValue}
					setNewVersionInputValue={setNewVesionInputValue}
					storyMapState={storyMapState}
					editMode={editMode}
					setItemsToBeDeleted={setItemsToBeDeleted}
					versionsToBeDeleted={versionsToBeDeleted}
					setVersionsToBeDeleted={setVersionsToBeDeleted}
				/>
			)}
		</div>
	)
}

export default StoryMapPage
