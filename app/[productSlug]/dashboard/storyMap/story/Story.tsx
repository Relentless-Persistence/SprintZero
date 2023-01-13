"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtom} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Story as StoryType} from "~/types/db/Products"

import {dragStateAtom} from "../atoms"
import {elementRegistry, layerBoundaries} from "../utils/globals"
import StoryContent from "./StoryContent"

export type StoryProps = {
	productId: Id
	epicId: Id
	featureId: Id
	story: StoryType
	inert?: boolean
}

const Story: FC<StoryProps> = ({productId, epicId, featureId, story, inert = false}) => {
	const [dragState, setDragState] = useAtom(dragStateAtom)

	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert) return
		elementRegistry.stories[story.id] = containerRef.current ?? undefined
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			elementRegistry.stories[story.id] = containerRef.current ?? undefined
		}
	}, [inert, story.id])

	return (
		<motion.div
			layoutId={
				dragState.id === epicId || dragState.id === featureId || dragState.id === story.id
					? undefined
					: `story-${story.id}`
			}
			layout="position"
			className={clsx(`p-1.5`, dragState.id === story.id && !inert && `invisible`)}
			ref={containerRef}
		>
			<motion.div
				onPointerDown={(e) => void e.preventDefault()}
				onPanStart={(e, info) =>
					void setDragState((prev) => ({
						...prev,
						id: story.id,
						type: `story`,
						yOffset: info.point.y - layerBoundaries[1],
					}))
				}
				className="-m-1.5 cursor-grab touch-none p-1.5 transition-transform hover:scale-105"
			>
				<StoryContent productId={productId} epicId={epicId} featureId={featureId} story={story} />
			</motion.div>
		</motion.div>
	)
}

export default Story
