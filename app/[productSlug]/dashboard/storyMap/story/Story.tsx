"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Story as StoryType} from "~/types/db/StoryMapStates"

import StoryContent from "./StoryContent"
import {storyMapStateAtom} from "../atoms"
import {dragState, elementRegistry, storyMapMeta} from "../utils/globals"

export type StoryProps = {
	story: StoryType
	inert?: boolean
}

const Story: FC<StoryProps> = ({story, inert = false}) => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	const storyMeta = storyMapMeta.current[story.id]
	const parentFeature = storyMapState?.features.find((feature) => feature.id === storyMeta?.parent)
	const parentEpicId = parentFeature && storyMapMeta.current[parentFeature.id]?.parent

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !containerRef.current || !contentRef.current) return
		elementRegistry[story.id] = {
			container: containerRef.current,
			content: contentRef.current,
		}
		return () => {
			if (!containerRef.current || !contentRef.current) return
			elementRegistry[story.id] = {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				container: containerRef.current,
				// eslint-disable-next-line react-hooks/exhaustive-deps
				content: contentRef.current,
			}
		}
	}, [story.id, inert])

	return (
		<motion.div
			layoutId={
				dragState.current?.id === parentEpicId ||
				dragState.current?.id === storyMeta?.parent ||
				dragState.current?.id === story.id
					? undefined
					: `story-${story.id}`
			}
			layout={
				dragState.current?.id === parentEpicId ||
				dragState.current?.id === storyMeta?.parent ||
				dragState.current?.id === story.id
					? undefined
					: `position`
			}
			className={clsx(`p-1.5`, dragState.current?.id === story.id && !inert && `invisible`)}
			ref={containerRef}
		>
			<div className="cursor-grab touch-none select-none transition-transform hover:scale-105" ref={contentRef}>
				<StoryContent story={story} />
			</div>
		</motion.div>
	)
}

export default Story
