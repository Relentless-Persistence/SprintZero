import {CopyOutlined, FileOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {useEffect, useRef} from "react"

import type {StoryMapMeta} from "./meta"
import type {DragInfo} from "./types"
import type {FC} from "react"
import type {Id} from "~/types"

import {elementRegistry} from "./globals"
import Story from "./Story"

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
					`flex min-w-[4rem] touch-none select-none items-center gap-2 rounded border border-current bg-white px-2 py-1 font-medium text-[#006378] active:cursor-grabbing`,
					inert ? `cursor-grabbing` : `cursor-grab`,
				)}
				ref={contentRef}
			>
				<CopyOutlined />
				<p>{feature.name}</p>
			</div>

			{(meta.currentVersionId !== `__ALL_VERSIONS__` || feature.childrenIds.length > 0) && (
				<div className="h-8 w-px border border-[#d0d0d0]" />
			)}

			{stories.length === 0 && meta.currentVersionId !== `__ALL_VERSIONS__` && (
				<button
					type="button"
					onClick={() => {
						if (meta.currentVersionId !== `__ALL_VERSIONS__`) meta.addStory({parentId: featureId}).catch(console.error)
					}}
					className="flex items-center gap-2 rounded border border-dashed border-current bg-white px-2 py-1 font-medium text-[#103001]"
				>
					<FileOutlined />
					<span>Add story</span>
				</button>
			)}

			{stories.length > 0 && (
				<div className="flex flex-col items-start gap-3 rounded-lg border border-[#0273b3] bg-[#f0f2f5] p-3">
					{stories.map((story) => (
						<Story key={story.id} meta={meta} dragInfo={dragInfo} storyId={story.id} inert={inert} />
					))}

					{meta.currentVersionId !== `__ALL_VERSIONS__` && (
						<button
							type="button"
							onClick={() => {
								if (meta.currentVersionId !== `__ALL_VERSIONS__`)
									meta.addStory({parentId: featureId}).catch(console.error)
							}}
							className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-[currentColor] bg-white px-2 py-1 font-medium text-[#103001]"
						>
							<FileOutlined />
							<span>Add story</span>
						</button>
					)}
				</div>
			)}
		</div>
	)
}

export default Feature
