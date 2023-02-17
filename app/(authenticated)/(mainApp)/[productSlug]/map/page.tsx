"use client"

import {MenuOutlined, PlusOutlined, RedoOutlined, UndoOutlined} from "@ant-design/icons"
import {FloatButton, Tooltip} from "antd"
import {collection, doc, orderBy, query, serverTimestamp, writeBatch} from "firebase/firestore"
import {motion} from "framer-motion"
import produce from "immer"
import {useState} from "react"
import {useCollection, useDocument} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic, Feature, Story} from "~/types/db/StoryMapStates"

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

	const [storyMapState] = useDocument(
		activeProduct?.exists()
			? doc(db, `StoryMapStates`, activeProduct.data().storyMapStateId).withConverter(StoryMapStateConverter)
			: undefined,
	)

	const [currentVersionId, setCurrentVersionId] = useState<Id | `__ALL_VERSIONS__` | undefined>(undefined)
	const [newVesionInputValue, setNewVesionInputValue] = useState<string | undefined>(undefined)

	const [versions] = useCollection(
		activeProduct?.exists()
			? collection(db, `StoryMapStates`, activeProduct.data().storyMapStateId, `Versions`).withConverter(
					VersionConverter,
			  )
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

		const batch = writeBatch(db)
		batch.update(storyMapState.ref, {
			currentHistoryId: nextHistory.id as Id,
			items: produce(storyMapState.data().items, (draft) => {
				for (const [id, value] of Object.entries(nextHistory.data().items)) {
					draft[id as Id] = {...draft[id as Id], ...HistorySchema.shape.items.element.parse(value)} as
						| Epic
						| Feature
						| Story
				}
			}),
			updatedAt: serverTimestamp(),
		})
		const currentHistory = histories.docs.find((history) => history.id === storyMapState.data().currentHistoryId)!
		batch.update(currentHistory.ref, {
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

		const batch = writeBatch(db)
		batch.update(storyMapState.ref, {
			currentHistoryId: lastHistory.id as Id,
			items: produce(storyMapState.data().items, (draft) => {
				for (const [id, value] of Object.entries(lastHistory.data().items)) {
					draft[id as Id] = {...draft[id as Id], ...HistorySchema.shape.items.element.parse(value)} as
						| Epic
						| Feature
						| Story
				}
			}),
			updatedAt: serverTimestamp(),
		})
		const currentHistory = histories.docs.find((history) => history.id === storyMapState.data().currentHistoryId)!
		batch.update(currentHistory.ref, {
			future: true,
		})
		await batch.commit()
	}

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
							icon={<RedoOutlined />}
							onClick={() => {
								redo().catch(console.error)
							}}
						/>
					</Tooltip>
					<Tooltip placement="left" title="Undo">
						<FloatButton
							icon={<UndoOutlined />}
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

			{activeProduct?.exists() && versions && (
				<VersionList
					allVersions={versions}
					currentVersionId={currentVersionId}
					setCurrentVersionId={setCurrentVersionId}
					newVersionInputValue={newVesionInputValue}
					setNewVersionInputValue={setNewVesionInputValue}
					storyMapStateId={activeProduct.data().storyMapStateId}
				/>
			)}
		</div>
	)
}

export default StoryMapPage
