"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import StoryContent from "./StoryContent"
import {dragState, elementRegistry, storyMapMeta} from "../utils/globals"

export type StoryProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	storyId: string
	inert?: boolean
}

const Story: FC<StoryProps> = ({activeProduct, storyMapState, storyId, inert = false}) => {
	const storyMeta = storyMapMeta.current[storyId]
	const parentFeature = storyMapState.features.find((feature) => feature.id === storyMeta?.parent)
	const parentEpicId = parentFeature && storyMapMeta.current[parentFeature.id]?.parent
	const story = storyMapState.stories.find((story) => story.id === storyId)!

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
				<StoryContent activeProduct={activeProduct} storyMapState={storyMapState} storyId={story.id} />
			</div>
		</motion.div>
	)
}

export default Story
