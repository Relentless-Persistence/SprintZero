"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Story as StoryType} from "~/types/db/Stories"

import {storyMapStateAtom} from "../atoms"
import {avg, elementRegistry, pointerOffset} from "../utils"
import StoryContent from "./StoryContent"

export type StoryProps = {
	story: StoryType
}

const Story: FC<StoryProps> = ({story}) => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	const storiesOrder = storyMapState
		.find(({epic}) => epic === story.epic)!
		.featuresOrder.find(({feature}) => feature === story.feature)!.storiesOrder
	const storyIndex = storiesOrder.findIndex(({story: storyId}) => storyId === story.id)

	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		elementRegistry.stories[story.id] = containerRef.current
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			elementRegistry.stories[story.id] = containerRef.current
		}
	}, [story.id])

	return (
		<motion.div
			drag
			dragSnapToOrigin
			layoutId={story.id}
			whileDrag="grabbing"
			onPointerDown={(e) => {
				e.stopPropagation()
				const containerRect = containerRef.current!.getBoundingClientRect()
				pointerOffset.current = [e.clientX - avg(containerRect.left, containerRect.right), 0]
			}}
			onDragEnd={() => void (pointerOffset.current = null)}
			className={clsx(
				`px-3`,
				storyIndex === 0 ? `pt-3` : `pt-1.5`,
				storyIndex === storiesOrder.length - 1 ? `pb-3` : `pb-1.5`,
			)}
			ref={containerRef}
		>
			<motion.div
				variants={{grabbing: {cursor: `grabbing`}}}
				className="-m-1.5 cursor-grab touch-none p-1.5 transition-transform hover:scale-105"
			>
				<StoryContent story={story} />
			</motion.div>
		</motion.div>
	)
}

export default Story
