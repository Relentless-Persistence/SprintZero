"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Story as StoryType} from "~/types/db/Products"

import {useGetFeature} from "../atoms"
import {avg, elementRegistry, pointerOffset} from "../utils"
import StoryContent from "./StoryContent"

export type StoryProps = {
	productId: Id
	epicId: Id
	featureId: Id
	story: StoryType
}

const Story: FC<StoryProps> = ({productId, epicId, featureId, story}) => {
	const stories = useGetFeature(epicId, featureId).stories
	const storyIndex = stories.findIndex(({id}) => id === story.id)

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
				storyIndex === stories.length - 1 ? `pb-3` : `pb-1.5`,
			)}
			ref={containerRef}
		>
			<motion.div
				variants={{grabbing: {cursor: `grabbing`}}}
				className="-m-1.5 cursor-grab touch-none p-1.5 transition-transform hover:scale-105"
			>
				<StoryContent productId={productId} epicId={epicId} featureId={featureId} story={story} />
			</motion.div>
		</motion.div>
	)
}

export default Story
