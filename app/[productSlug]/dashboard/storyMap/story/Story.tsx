"use client"

import {motion} from "framer-motion"
import {useAtom} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Story as StoryType} from "~/types/db/Products"

import {dragStateAtom} from "../atoms"
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

	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		elementRegistry.stories[story.id] = containerRef.current ?? undefined
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			elementRegistry.stories[story.id] = containerRef.current ?? undefined
		}
	}, [story.id])

	return (
		<motion.div
			className="p-1.5"
			style={
				{
					// x: dragState.id === story.id && dragState.pos[0] ? dragState.pos[0] : `0px`,
					// y: dragState.id === story.id && dragState.pos[1] ? dragState.pos[1] : `0px`,
				}
			}
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
