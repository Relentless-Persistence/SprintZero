import {CopyOutlined, MinusCircleOutlined, PlusOutlined, ReadOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {updateDoc} from "firebase/firestore"
import {useAnimationFrame} from "framer-motion"
import {useEffect, useRef, useState} from "react"

import type {DragInfo} from "./types"
import type {FC} from "react"

import Feature from "./Feature"
import {elementRegistry} from "./globals"
import {useStoryMapContext} from "./StoryMapContext"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {addFeature, sortFeatures, updateItem} from "~/utils/storyMap"

export type EpicProps = {
	epicId: string
	dragInfo: DragInfo
	onMarkForDeletion: (id: string) => void
	inert?: boolean
}

const Epic: FC<EpicProps> = ({epicId, dragInfo, onMarkForDeletion, inert = false}) => {
	const {product, user} = useAppContext()
	const {storyMapItems, versions, editMode, setItemsToBeDeleted} = useStoryMapContext()

	const epic = storyMapItems.docs.find((item) => item.id === epicId)!
	const children = sortFeatures(storyMapItems.docs.filter((item) => item.data().parentId === epicId))
	const grandchildren = storyMapItems.docs.filter((item) => children.some((child) => child.id === item.data().parentId))

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useAnimationFrame(() => {
		elementRegistry[epicId] = {
			container: containerRef.current ?? undefined,
			content: contentRef.current ?? undefined,
		}
	})

	const [localEpicName, setLocalEpicName] = useState(epic.data().name)
	useEffect(() => {
		setLocalEpicName(epic.data().name)
	}, [epic])

	return (
		<div
			className={clsx(
				`grid justify-items-center gap-x-6`,
				dragInfo.itemBeingDraggedId === epic.id && !inert && `invisible`,
			)}
			style={{gridTemplateColumns: `repeat(${children.length}, auto)`}}
		>
			<div
				className={clsx(
					`flex touch-none select-none items-center gap-2 rounded border border-current bg-bgContainer px-2 py-1 font-medium leading-tight text-[#4f2dc8] dark:text-[#6b44f8]`,
					inert && `cursor-grabbing`,
					!editMode && `cursor-grab active:cursor-grabbing`,
				)}
				ref={contentRef}
			>
				<ReadOutlined />
				{(epic.data().initialRenameDone || inert) && !editMode ? (
					<p className={clsx(`my-0.5`, localEpicName === `` && `invisible`)}>{localEpicName || `_`}</p>
				) : (
					<div className="relative my-0.5 min-w-[1rem]">
						<p>{localEpicName || `_`}</p>
						<input
							value={localEpicName}
							autoFocus={!epic.data().initialRenameDone && !editMode}
							onBlur={() => {
								updateDoc(epic.ref, {initialRenameDone: true}).catch(console.error)
							}}
							onKeyDown={(e) => {
								if (e.key === `Enter`) updateDoc(epic.ref, {initialRenameDone: true}).catch(console.error)
							}}
							className="absolute inset-0 w-full rounded-sm bg-bgContainer focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-primaryHover"
							onChange={(e) => {
								setLocalEpicName(e.target.value)
								updateItem(product, storyMapItems, versions, epic.id, {name: e.target.value}).catch(console.error)
							}}
							onPointerDownCapture={(e) => e.stopPropagation()}
						/>
					</div>
				)}
				{editMode && (
					<button
						type="button"
						onClick={() => {
							onMarkForDeletion(epic.id)
							children.forEach((feature) => onMarkForDeletion(feature.id))
							grandchildren.forEach((story) => onMarkForDeletion(story.id))
						}}
					>
						<MinusCircleOutlined className="text-sm text-error" />
					</button>
				)}
			</div>

			{/* Pad out the remaining columns in row 1 */}
			{Array(Math.max(children.length - 1, 0))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row1-${i}`} />
				))}

			{/* Pad out the beginning columns in row 2 */}
			{Array(Math.max(children.length, editMode ? 0 : 1))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row2-${i}`} className="relative h-16 w-[calc(100%+1.5rem)]">
						{/* Top */}
						{i === 0 && <div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 border border-border" />}
						{/* Right */}
						{i < children.length - 1 && (
							<div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 border border-border" />
						)}
						{/* Bottom */}
						<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-border" />
						{/* Left */}
						{i > 0 && <div className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 border border-border" />}

						{i === children.length - 1 && children.length > 0 && !editMode && (
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<button
									type="button"
									onClick={() => {
										addFeature(product, storyMapItems, versions, {parentId: epic.id}, user.id).catch(console.error)
									}}
									className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[0.6rem] text-white"
								>
									<PlusOutlined />
								</button>
							</div>
						)}
					</div>
				))}

			{children
				.filter((feature) => feature.data().parentId === epic.id)
				.map((feature) => (
					<Feature
						key={feature.id}
						featureId={feature.id}
						inert={inert}
						dragInfo={dragInfo}
						onMarkForDeletion={(id: string) => {
							setItemsToBeDeleted((prev) => [...prev, id])
						}}
					/>
				))}

			{children.length === 0 && !editMode && (
				<button
					type="button"
					onClick={() => {
						addFeature(product, storyMapItems, versions, {parentId: epic.id}, user.id).catch(console.error)
					}}
					className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#006378] dark:bg-black dark:text-[#00a2c4]"
				>
					<CopyOutlined />
					<span className="my-1">Add feature</span>
				</button>
			)}
		</div>
	)
}

export default Epic
