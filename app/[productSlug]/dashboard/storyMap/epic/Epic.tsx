"use client"

import clsx from "clsx"
import {motion, useDragControls} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import {storyMapStateAtom} from "../atoms"
import {avg, pointerLocation, elementRegistry, epicBoundaries, pointerOffset} from "../utils"
import EpicContent from "./EpicContent"
import FeatureList from "./FeatureList"
import SmallAddFeatureButton from "./SmallAddFeatureButton"
import {moveEpicTo} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type EpicProps = {
	epic: EpicType
}

const Epic: FC<EpicProps> = ({epic}) => {
	const dragControls = useDragControls()

	const activeProductId = useActiveProductId()
	const storyMapState = useAtomValue(storyMapStateAtom)
	const epicIndex = storyMapState.findIndex(({epic: epicId}) => epicId === epic.id)
	const featuresOrder = storyMapState[epicIndex]!.featuresOrder
	const prevEpic = epicIndex > 0 ? storyMapState[epicIndex - 1]!.epic : null
	const nextEpic = epicIndex < storyMapState.length - 1 ? storyMapState[epicIndex + 1]!.epic : null

	const contentRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		elementRegistry.epics[epic.id] = {
			content: contentRef.current,
			container: containerRef.current,
		}
		return () => {
			elementRegistry.epics[epic.id] = {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				content: contentRef.current,
				// eslint-disable-next-line react-hooks/exhaustive-deps
				container: containerRef.current,
			}
		}
	}, [epic.id])

	return (
		<motion.div
			layoutId={epic.id}
			layout="position"
			drag
			dragControls={dragControls}
			whileDrag="grabbing"
			dragListener={false}
			dragSnapToOrigin
			onPointerDown={(e) => {
				const contentRect = contentRef.current!.getBoundingClientRect()
				pointerOffset.current = [e.clientX - avg(contentRect.left, contentRect.right), 0]
			}}
			onDragEnd={() => void (pointerOffset.current = null)}
			// onDrag={(e, info) => {
			// 	if (prevEpic !== null) {
			// 		const prevEpicPosition = epicDividers[prevEpic]!
			// 		if (info.offset.x < prevEpicPosition.center - startPos.current)
			// 			moveEpicTo({productId: activeProductId!, epicId: epic.id, position: epicIndex - 1})
			// 	}
			// 	if (nextEpic !== null) {
			// 		const nextEpicPosition = epicDividers[nextEpic]!
			// 		if (info.offset.x > nextEpicPosition.center - startPos.current)
			// 			moveEpicTo({productId: activeProductId!, epicId: epic.id, position: epicIndex + 1})
			// 	}
			// }}
			className={clsx(`grid justify-items-center gap-y-4`, featuresOrder.length === 0 && `px-4`)}
			style={{gridTemplateColumns: `repeat(${featuresOrder.length}, auto)`}}
			ref={containerRef}
		>
			<motion.div
				variants={{grabbing: {cursor: `grabbing`}}}
				onPointerDown={(e) => {
					e.preventDefault()
					dragControls.start(e)
				}}
				className="-m-4 cursor-grab touch-none p-4 transition-transform hover:scale-105"
			>
				<EpicContent epic={epic} ref={contentRef} />
			</motion.div>

			{/* Pad out the remaining columns in row 1 */}
			{Array(Math.max(featuresOrder.length - 1, 0))
				.fill(null)
				.map((_, i) => (
					<div key={`filler-${epic.id}-row1-${i}`} />
				))}

			{/* Pad out the beginning columns in row 2 */}
			{Array(Math.max(featuresOrder.length - 1, 0))
				.fill(null)
				.map((_, i) => (
					<div key={`filler-${epic.id}-row2-${i}`} />
				))}

			<SmallAddFeatureButton epic={epic} />

			<FeatureList epic={epic} />
		</motion.div>
	)
}

export default Epic
