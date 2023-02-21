"use client"

import {MenuOutlined, PlusOutlined, RedoOutlined, UndoOutlined} from "@ant-design/icons"
import {FloatButton, Tooltip} from "antd"
import clsx from "clsx"
import {collection, doc, orderBy, query, serverTimestamp, where, writeBatch} from "firebase/firestore"
import {motion} from "framer-motion"
import {useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import VersionList from "./storyMap/VersionList"
import {HistoryConverter, HistorySchema} from "~/types/db/Histories"
import {ProductConverter} from "~/types/db/Products"
import {StoryMapStateConverter} from "~/types/db/StoryMapStates"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"
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

	return (
		<div className="grid h-full grid-cols-[1fr_6rem]">
			<div className="relative flex flex-col gap-8">
				{currentVersionId && (
					<StoryMapHeader
						versionName={versions?.docs.find((version) => version.id === currentVersionId)?.data().name}
					/>
				)}

				<div className="relative w-full grow">
					<motion.div layoutScroll className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2">
						{activeProduct?.exists() && storyMapState?.exists() && currentVersionId !== undefined && versions && (
							<StoryMap storyMapState={storyMapState} allVersions={versions} currentVersionId={currentVersionId} />
						)}
					</motion.div>
				</div>

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
				</FloatButton.Group>
			</div>

			{activeProduct?.exists() && storyMapState && versions && (
				<VersionList
					allVersions={versions}
					currentVersionId={currentVersionId}
					setCurrentVersionId={setCurrentVersionId}
					newVersionInputValue={newVesionInputValue}
					setNewVersionInputValue={setNewVesionInputValue}
					storyMapStateId={storyMapState.id as Id}
				/>
			)}
		</div>
	)
}

export default StoryMapPage
