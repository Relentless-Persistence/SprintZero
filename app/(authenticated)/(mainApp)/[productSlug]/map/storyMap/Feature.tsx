import {CopyOutlined, FileOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {collection} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {StoryMapMeta} from "./utils/meta"
import type {DragInfo} from "./utils/types"
import type {FC} from "react"
import type {Id} from "~/types"

import FeatureDrawer from "./FeatureDrawer"
import Story from "./Story"
import {elementRegistry} from "./utils/globals"
import {VersionConverter} from "~/types/db/Versions"
import {db} from "~/utils/firebase"

export type FeatureProps = {
	meta: StoryMapMeta
	dragInfo: DragInfo
	featureId: Id
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({meta, dragInfo, featureId, inert = false}) => {
	const feature = meta.features.find((feature) => feature.id === featureId)!

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[featureId] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[featureId] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [featureId, inert])

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const [versions] = useCollectionData(
		collection(db, `StoryMapStates`, meta.id, `Versions`).withConverter(VersionConverter),
	)

	const stories = feature.childrenIds
		.map((id) => meta.stories.find((story) => story.id === id)!)
		.filter((story) => {
			if (meta.currentVersionId === `__ALL_VERSIONS__`) return true
			return story.versionId === meta.currentVersionId
		})

	return (
		<div
			className={clsx(`flex flex-col items-center`, dragInfo.itemBeingDraggedId === featureId && !inert && `invisible`)}
		>
			<div
				className={clsx(
					`flex min-w-[4rem] touch-none select-none items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378] transition-transform hover:scale-105 active:cursor-grabbing`,
					inert ? `cursor-grabbing` : `cursor-grab`,
				)}
				ref={contentRef}
			>
				<button type="button" onClick={() => setIsDrawerOpen(true)} onPointerDownCapture={(e) => e.stopPropagation()}>
					<CopyOutlined />
				</button>
				<p>{feature.name}</p>
			</div>

			{(meta.currentVersionId !== `__ALL_VERSIONS__` || feature.childrenIds.length > 0) && (
				<div className="h-8 w-px border border-dashed border-[#006378]" />
			)}

			{stories.length === 0 && meta.currentVersionId !== `__ALL_VERSIONS__` && (
				<button
					type="button"
					onClick={() => {
						if (meta.currentVersionId !== `__ALL_VERSIONS__`) meta.addStory({parentId: featureId}).catch(console.error)
					}}
					className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
				>
					<FileOutlined />
					<span>Add story</span>
				</button>
			)}

			{stories.length > 0 && (
				<div className="flex flex-col items-start gap-3 rounded-md border border-[#006378] bg-white p-3">
					{versions &&
						stories.map((story) => (
							<Story key={story.id} meta={meta} dragInfo={dragInfo} storyId={story.id} inert={inert} />
						))}

					{meta.currentVersionId !== `__ALL_VERSIONS__` && (
						<button
							type="button"
							onClick={() => {
								if (meta.currentVersionId !== `__ALL_VERSIONS__`)
									meta.addStory({parentId: featureId}).catch(console.error)
							}}
							className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
						>
							<FileOutlined />
							<span>Add story</span>
						</button>
					)}
				</div>
			)}

			<FeatureDrawer meta={meta} featureId={featureId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Feature
