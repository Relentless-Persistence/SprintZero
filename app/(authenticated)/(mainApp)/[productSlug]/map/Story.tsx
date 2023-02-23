import {MinusCircleOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {useEffect, useRef, useState} from "react"

import type {StoryMapMeta} from "./meta"
import type {FC} from "react"
import type {Id} from "~/types"

import {elementRegistry} from "./globals"
import StoryDrawer from "./StoryDrawer"
import {updateItem} from "~/utils/storyMap"

export type StoryProps = {
	meta: StoryMapMeta
	storyId: Id
	inert?: boolean
	isInitialRender?: boolean
}

const Story: FC<StoryProps> = ({meta, storyId, inert = false, isInitialRender}) => {
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
	useEffect(() => {
		setLocalStoryName(story.name)
	}, [story.name])

	const [hasBlurred, setHasBlurred] = useState(isInitialRender)

	return (
		<div
			className={clsx(
				`flex touch-none select-none items-center gap-1 overflow-hidden rounded border border-[#d9d9d9] bg-white pr-1 font-medium`,
				inert && `cursor-grabbing`,
				!meta.editMode && `cursor-grab  active:cursor-grabbing`,
			)}
			ref={contentRef}
		>
			<button
				type="button"
				onClick={() => setIsDrawerOpen(true)}
				onPointerDownCapture={(e) => e.stopPropagation()}
				className="border-r border-[#d9d9d9] bg-[#f5f5f5] p-2 text-[0.6rem]"
			>
				<p className="max-h-8 truncate leading-none [writing-mode:vertical-lr]">{version?.data().name}</p>
			</button>
			{(hasBlurred || inert) && !meta.editMode ? (
				<p className="mx-1">{localStoryName}</p>
			) : (
				<div className="relative mx-auto min-w-[1rem]">
					<p className="mx-1">{localStoryName || `_`}</p>
					<input
						value={localStoryName}
						autoFocus={!isInitialRender && !meta.editMode}
						onBlur={() => setHasBlurred(true)}
						onKeyDown={(e) => {
							if (e.key === `Enter`) setHasBlurred(true)
						}}
						className="absolute inset-0 mx-1"
						onChange={(e) => {
							setLocalStoryName(e.target.value)
							updateItem(meta.storyMapState, story.id, {name: e.target.value}, meta.allVersions).catch(console.error)
						}}
						onPointerDownCapture={(e) => e.stopPropagation()}
					/>
				</div>
			)}
			{meta.editMode && (
				<button type="button" onClick={() => meta.markForDeletion(storyId)}>
					<MinusCircleOutlined className="mr-1 text-[#ff4d4f]" />
				</button>
			)}

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</div>
	)
}

export default Story
