import {CopyOutlined, FileOutlined, MinusCircleOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {updateDoc} from "firebase/firestore"
import {useAnimationFrame} from "framer-motion"
import {useEffect, useRef, useState} from "react"

import type {DragInfo} from "./types"
import type {FC} from "react"

import {elementRegistry} from "./globals"
import Story from "./Story"
import {useStoryMapContext} from "./StoryMapContext"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {AllVersions, addStory, sortStories, updateItem} from "~/utils/storyMap"

export type FeatureProps = {
	featureId: string
	dragInfo: DragInfo
	onMarkForDeletion: (id: string) => void
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({featureId, dragInfo, onMarkForDeletion, inert = false}) => {
	const {product, user} = useAppContext()
	const {storyMapItems, versions, editMode, currentVersionId, setItemsToBeDeleted} = useStoryMapContext()

	const feature = storyMapItems.docs.find((feature) => feature.id === featureId)!
	const children = sortStories(
		storyMapItems.docs
			.filter((item) => item.data().parentId === featureId)
			.filter((item) => item.data().versionId === currentVersionId || currentVersionId === AllVersions),
		versions,
	)

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useAnimationFrame(() => {
		elementRegistry[featureId] = {
			container: containerRef.current ?? undefined,
			content: contentRef.current ?? undefined,
		}
	})

	const [localFeatureName, setLocalFeatureName] = useState(feature.data().name)
	useEffect(() => {
		setLocalFeatureName(feature.data().name)
	}, [feature])

	return (
		<div
			className={clsx(
				`flex flex-col items-center`,
				dragInfo.itemBeingDraggedId === feature.id && !inert && `invisible`,
			)}
			ref={containerRef}
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
				{(feature.data().initialRenameDone || inert) && !editMode ? (
					<p className={clsx(`my-0.5`, localFeatureName === `` && `invisible`)}>{localFeatureName || `_`}</p>
				) : (
					<div className="relative my-0.5 min-w-[1rem]">
						<p>{localFeatureName || `_`}</p>
						<input
							value={localFeatureName}
							autoFocus={!feature.data().initialRenameDone && !editMode}
							onBlur={() => {
								updateDoc(feature.ref, {initialRenameDone: true}).catch(console.error)
							}}
							onKeyDown={(e) => {
								if (e.key === `Enter`) updateDoc(feature.ref, {initialRenameDone: true}).catch(console.error)
							}}
							className="absolute inset-0 w-full rounded-sm bg-bgContainer focus:outline focus:outline-1 focus:outline-offset-1 focus:outline-primaryHover"
							onChange={(e) => {
								setLocalFeatureName(e.target.value)
								updateItem(product, storyMapItems, versions, feature.id, {name: e.target.value}).catch(console.error)
							}}
							onPointerDownCapture={(e) => e.stopPropagation()}
						/>
					</div>
				)}
				{editMode && (
					<button
						type="button"
						onClick={() => {
							onMarkForDeletion(featureId)
							children.forEach((story) => onMarkForDeletion(story.id))
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
							addStory(product, storyMapItems, versions, {parentId: feature.id}, user.id, currentVersionId).catch(
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
						<Story
							key={story.id}
							storyId={story.id}
							inert={inert}
							dragInfo={dragInfo}
							onMarkForDeletion={() => {
								setItemsToBeDeleted((prev) => [...prev, story.id])
							}}
						/>
					))}

					{currentVersionId !== AllVersions && !editMode && (
						<button
							type="button"
							onClick={() => {
								if (currentVersionId !== AllVersions)
									addStory(product, storyMapItems, versions, {parentId: feature.id}, user.id, currentVersionId).catch(
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
		</div>
	)
}

export default Feature
