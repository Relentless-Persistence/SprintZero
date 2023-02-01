"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import EpicContent from "./EpicContent"
import FeatureList from "./FeatureList"
import SmallAddFeatureButton from "./SmallAddFeatureButton"
import {dragState, elementRegistry} from "../utils/globals"

export type EpicProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	epicId: string
	inert?: boolean
}

const Epic: FC<EpicProps> = ({activeProduct, storyMapState, epicId, inert = false}) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const epic = storyMapState.epics.find((epic) => epic.id === epicId)!
	useEffect(() => {
		if (inert || !containerRef.current || !contentRef.current) return
		elementRegistry[epicId] = {
			container: containerRef.current,
			content: contentRef.current,
		}
		return () => {
			if (!containerRef.current || !contentRef.current) return
			elementRegistry[epicId] = {
				container: containerRef.current, // eslint-disable-line react-hooks/exhaustive-deps
				content: contentRef.current, // eslint-disable-line react-hooks/exhaustive-deps
			}
		}
	}, [epicId, inert])

	return (
		<motion.div
			layoutId={dragState.current?.id === epicId ? undefined : `epic-${epicId}`}
			layout={dragState.current?.id === epicId ? undefined : `position`}
			className={clsx(`grid justify-items-center gap-x-4`, dragState.current?.id === epicId && !inert && `invisible`)}
			style={{gridTemplateColumns: `repeat(${epic.featureIds.length}, auto)`}}
			ref={containerRef}
		>
			<div className="cursor-grab touch-none select-none transition-transform hover:scale-105" ref={contentRef}>
				<EpicContent epic={epic} />
			</div>

			{/* Pad out the remaining columns in row 1 */}
			{Array(Math.max(epic.featureIds.length - 1, 0))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row1-${i}`} />
				))}

			{/* Pad out the beginning columns in row 2 */}
			{Array(Math.max(epic.featureIds.length, 1))
				.fill(undefined)
				.map((_, i) => (
					<div key={`row2-${i}`} className="relative h-16 w-[calc(100%+1rem-2px)]">
						{/* Top */}
						{i === 0 && (
							<div className="absolute left-1/2 top-0 h-[calc(50%-2px)] w-px -translate-x-1/2 border border-dashed border-[#4f2dc8]" />
						)}
						{/* Right */}
						{i < epic.featureIds.length - 1 && (
							<div className="absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 border border-dashed border-[#4f2dc8]" />
						)}
						{/* Bottom */}
						<div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 border border-dashed border-[#4f2dc8]" />
						{/* Left */}
						{i > 0 && (
							<div className="absolute left-0 top-1/2 h-px w-1/2 -translate-y-1/2 border border-dashed border-[#4f2dc8]" />
						)}

						{i === epic.featureIds.length - 1 && epic.featureIds.length > 0 && (
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
								<SmallAddFeatureButton epic={epic} />
							</div>
						)}
					</div>
				))}

			<FeatureList activeProduct={activeProduct} storyMapState={storyMapState} epicId={epicId} inert={inert} />
		</motion.div>
	)
}

export default Epic
