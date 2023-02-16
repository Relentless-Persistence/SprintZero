import clsx from "clsx"
import {useEffect, useRef, useState} from "react"

import type {StoryMapMeta} from "./meta"
import type {DragInfo} from "./types"
import type {FC} from "react"
import type {Id} from "~/types"

import {elementRegistry} from "./globals"
import StoryDrawer from "./StoryDrawer"

export type StoryProps = {
	meta: StoryMapMeta
	dragInfo: DragInfo
	storyId: Id
	inert?: boolean
}

const Story: FC<StoryProps> = ({meta, dragInfo, storyId, inert = false}) => {
	const story = meta.stories.find((story) => story.id === storyId)!

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[story.id] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[story.id] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [story.id, inert])

	const version = meta.allVersions.docs.find((version) => version.id === story.versionId)

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [localStoryName, setLocalStoryName] = useState(story.name)

	return (
		// Don't delete this wrapper div. Epics and features require a .parentElement lookup for drag-and-drop offset, so
		// I artifically added a wrapper div here to keep the same structure as everything else.
		<div>
			<div
				className={clsx(
					`flex touch-none select-none items-center gap-1 overflow-hidden rounded border border-[#103001] bg-white pr-1 active:cursor-grabbing`,
					inert ? `cursor-grabbing` : `cursor-grab`,
					dragInfo.itemBeingDraggedId === storyId && !inert && `invisible`,
				)}
				ref={contentRef}
			>
				<button
					type="button"
					onClick={() => setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => e.stopPropagation()}
					className="border-r border-[#103001] bg-[#f5f5f5] p-2 text-[0.6rem]"
				>
					<p className="max-h-8 truncate leading-none [writing-mode:vertical-lr]">{version?.data().name}</p>
				</button>
				<div className="relative mx-auto min-w-[1rem] font-medium text-black">
					<p className="mx-1">{localStoryName || `_`}</p>
					<input
						value={localStoryName}
						className="absolute inset-0 mx-1"
						onChange={(e) => {
							setLocalStoryName(e.target.value)
							meta.updateEpic(story.id, {name: e.target.value}).catch(console.error)
						}}
					/>
				</div>
			</div>

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Story
