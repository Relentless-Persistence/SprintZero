import { CopyOutlined, FileOutlined, MinusCircleOutlined } from "@ant-design/icons"
import clsx from "clsx"
import { doc, updateDoc } from "firebase/firestore"
import { motion, useAnimationFrame } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import type { DragInfo } from "./types"
import type { FC } from "react"

import { elementRegistry } from "./globals"
import Story from "./Story"
import { useStoryMapContext } from "./StoryMapContext"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { AllVersions, addStory, sortStories, updateItem } from "~/utils/storyMap"

export type FeatureProps = {
	featureId: string
	dragInfo: DragInfo
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({ featureId, dragInfo, inert = false }) => {
	const { product, user } = useAppContext()
	const { storyMapItems, versions, editMode, currentVersionId, itemsToBeDeleted, setItemsToBeDeleted } =
		useStoryMapContext()

	const feature = storyMapItems.find((feature) => feature.id === featureId)!
	const children = sortStories(
		storyMapItems
			.filter((item) => item.parentId === featureId)
			.filter((item) => item.versionId === currentVersionId || currentVersionId === AllVersions)
			.filter((item) => !item.deleted)
			.filter((item) => !itemsToBeDeleted.includes(item.id)),
		versions,
	)

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useAnimationFrame(() => {
		if (dragInfo.itemBeingDraggedId === undefined || inert)
			elementRegistry[featureId] = {
				container: containerRef.current ?? undefined,
				content: contentRef.current ?? undefined,
			}
	})

	const [localFeatureName, setLocalFeatureName] = useState(feature.name)
	useEffect(() => {
		setLocalFeatureName(feature.name)
	}, [feature.name])

	// const isParentMoving = dragInfo.itemBeingDraggedId === feature.parentId

	return (
		<div ref={containerRef}>
			<motion.div
				// layoutId={featureId}
				// layout={isParentMoving ? false : `position`}
				className={clsx(
					`flex flex-col items-center`,
					dragInfo.itemBeingDraggedId === feature.id && !inert && `invisible`,
				)}
			>
				<div
					className={clsx(
						`flex min-w-[4rem] touch-none select-none items-center gap-2 rounded border border-current bg-bgContainer px-2 py-1 font-medium leading-tight text-[#006378] dark:text-[#00a2c4]`,
						inert && `cursor-grabbing`,
						!editMode && `cursor-grab active:cursor-grabbing`,
					)}
					ref={contentRef}
				>
					<CopyOutlined />
					{(feature.initialRenameDone || inert) && !editMode ? (
						<p className={clsx(`m-0.5`, localFeatureName === `` && `invisible`)}>{localFeatureName || `_`}</p>
					) : (
						<div className="relative my-0.5 min-w-[1rem]">
							<p className="px-0.5">{localFeatureName || `_`}</p>
							<input
								value={localFeatureName}
								autoFocus={!feature.initialRenameDone && !editMode && user.id === feature.updatedAtUserId}
								onFocus={(e) => e.target.select()}
								onBlur={() => {
									if (localFeatureName !== ``)
										updateDoc(doc(product.ref, `StoryMapItems`, featureId), { initialRenameDone: true }).catch(
											console.error,
										)
								}}
								onKeyDown={(e) => {
									if (e.key === `Enter`)
										updateDoc(doc(product.ref, `StoryMapItems`, featureId), { initialRenameDone: true }).catch(
											console.error,
										)
								}}
								className={clsx(
									`absolute inset-0 w-full rounded-sm bg-bgContainer px-0.5 outline-none`,
									localFeatureName === ``
										? `bg-errorBg outline-2 outline-errorBorder`
										: `focus:outline-2 focus:outline-primaryHover`,
								)}
								onChange={(e) => {
									setLocalFeatureName(e.target.value)
									if (e.target.value === ``) return
									updateItem(product, storyMapItems, versions, feature.id, { name: e.target.value }).catch(console.error)
								}}
								onPointerDownCapture={(e) => e.stopPropagation()}
							/>
						</div>
					)}
					{editMode && (
						<button
							type="button"
							onClick={() => {
								setItemsToBeDeleted((prev) => [...prev, featureId, ...children.map((child) => child.id)])
							}}
						>
							<MinusCircleOutlined className="text-sm text-error" />
						</button>
					)}
				</div>

				{((currentVersionId !== AllVersions && !editMode) || children.length > 0) && (
					<div className="h-8 w-px border border-border" />
				)}

				{children.length === 0 && currentVersionId !== AllVersions && !editMode && (
					<button
						type="button"
						onClick={() => {
							if (currentVersionId !== AllVersions)
								addStory(product, storyMapItems, versions, { parentId: feature.id }, user.id, currentVersionId).catch(
									console.error,
								)
						}}
						className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#0e3101] dark:bg-black dark:text-[#757575]"
					>
						<FileOutlined />
						<span className="my-1">Add story</span>
					</button>
				)}

				{children.length > 0 && (
					<div className="flex flex-col items-start gap-3 rounded-lg border-2 border-border p-3">
						{children.map((story) => (
							<Story key={story.id} storyId={story.id} inert={inert} dragInfo={dragInfo} />
						))}

						{currentVersionId !== AllVersions && !editMode && (
							<button
								type="button"
								onClick={() => {
									if (currentVersionId !== AllVersions)
										addStory(product, storyMapItems, versions, { parentId: feature.id }, user.id, currentVersionId).catch(
											console.error,
										)
								}}
								className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#0e3101] dark:bg-black dark:text-[#757575]"
							>
								<FileOutlined />
								<span className="my-1">Add story</span>
							</button>
						)}
					</div>
				)}
			</motion.div>
		</div>
	)
}

export default Feature
