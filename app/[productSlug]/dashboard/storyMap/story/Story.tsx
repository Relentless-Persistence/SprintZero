"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtom} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Story as StoryType} from "~/types/db/Products"

import {dragStateAtom, useGetFeature} from "../atoms"
import {elementRegistry} from "../utils"
import StoryContent from "./StoryContent"

export type StoryProps = {
	productId: Id
	epicId: Id
	featureId: Id
	story: StoryType
}

const Story: FC<StoryProps> = ({productId, epicId, featureId, story}) => {
	const [dragState, setDragState] = useAtom(dragStateAtom)
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
			layoutId={story.id}
			layout="position"
			className={clsx(
				`px-3`,
				storyIndex === 0 ? `pt-3` : `pt-1.5`,
				storyIndex === stories.length - 1 ? `pb-3` : `pb-1.5`,
			)}
			style={{
				x: dragState.id === story.id && dragState.pos[0] ? dragState.pos[0] : `0px`,
				y: dragState.id === story.id && dragState.pos[1] ? dragState.pos[1] : `0px`,
			}}
			ref={containerRef}
		>
			<motion.div
				onPointerDown={(e) => {
					e.preventDefault()
					setDragState((prev) => ({...prev, id: story.id, type: `story`}))
				}}
				className="-m-1.5 cursor-grab touch-none p-1.5 transition-transform hover:scale-105"
			>
				<StoryContent productId={productId} epicId={epicId} featureId={featureId} story={story} />
			</motion.div>
		</motion.div>
	)
}

export default Story
