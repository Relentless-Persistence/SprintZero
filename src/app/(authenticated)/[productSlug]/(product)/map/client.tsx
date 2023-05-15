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
import { FloatButton, Tooltip } from "antd"
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
import { motion } from "framer-motion"
import produce from "immer"
import { nanoid } from "nanoid"
import { useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { FC } from "react"
import type { HistoryItem } from "~/types/db/Products/StoryMapHistories/HistoryItems"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems"
import type { AllVersions } from "~/utils/storyMap"

import StoryMap from "./StoryMap"
import { StoryMapContext } from "./StoryMapContext"
import StoryMapHeader from "./StoryMapHeader"
import VersionList from "./VersionList"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { StoryMapHistoryConverter } from "~/types/db/Products/StoryMapHistories"
import { HistoryItemConverter } from "~/types/db/Products/StoryMapHistories/HistoryItems"
import { StoryMapItemConverter } from "~/types/db/Products/StoryMapItems"
import { VersionConverter } from "~/types/db/Products/Versions"
import { db } from "~/utils/firebase"

const StoryMapClientPage: FC = () => {
	const { product } = useAppContext()
	const [storyMapItems, , storyMapItemsError] = useCollection(
		collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter),
	)
	useErrorHandler(storyMapItemsError)
	const [versions, , versionsError] = useCollection(collection(product.ref, `Versions`).withConverter(VersionConverter))
	useErrorHandler(versionsError)

	const [currentVersionId, setCurrentVersionId] = useState<string | typeof AllVersions | undefined>(undefined)
	const [newVersionInputValue, setNewVersionInputValue] = useState<string | undefined>(undefined)

	useEffect(() => {
		if (currentVersionId === undefined && versions?.docs[0]) setCurrentVersionId(versions.docs[0].id)
	}, [currentVersionId, setCurrentVersionId, versions?.docs])

	const [editMode, setEditMode] = useState(false)
	const [itemsToBeDeleted, setItemsToBeDeleted] = useState<string[]>([])
	const [versionsToBeDeleted, setVersionsToBeDeleted] = useState<string[]>([])

	const scrollContainerRef = useRef<HTMLDivElement | null>(null)

	let lastUpdated: Timestamp | null = null
	if (product.exists() && product.data().storyMapUpdatedAt instanceof Timestamp)
		lastUpdated = product.data().storyMapUpdatedAt

	if (!product.exists() || !storyMapItems || !versions || currentVersionId === undefined) return null
	return (
		<StoryMapContext.Provider
			value={{
				storyMapItems: storyMapItems.docs.map((item) => item.data()),
				versions,
				editMode,
				setEditMode,
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
			<div className="grid h-full grid-cols-[1fr_9rem]">
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

					{/* {editMode ? (
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
					)} */}
				</div>

				<VersionList />
			</div>
		</StoryMapContext.Provider>
	)
}

export default StoryMapClientPage
