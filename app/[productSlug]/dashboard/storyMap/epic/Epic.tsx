"use client"

import clsx from "clsx"
import {motion, useDragControls} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic as EpicType} from "~/types/db/Products"

import {storyMapStateAtom, useGetEpic} from "../atoms"
import {avg, elementRegistry, pointerOffset, moveEpic, getTargetLocation} from "../utils"
import EpicContent from "./EpicContent"
import FeatureList from "./FeatureList"
import SmallAddFeatureButton from "./SmallAddFeatureButton"
import {setStoryMapState} from "~/utils/api/mutations"

export type EpicProps = {
	productId: Id
	epic: EpicType
}

const Epic: FC<EpicProps> = ({productId, epic}) => {
	const dragControls = useDragControls()

	const features = useGetEpic(epic.id).features

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

	const storyMapState = useAtomValue(storyMapStateAtom)
	const originalStoryMapState = useRef(storyMapState)
	const isUpdating = useRef(false)

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
			onDragStart={() => void (originalStoryMapState.current = storyMapState)}
			onDragEnd={() => void (pointerOffset.current = null)}
			onDrag={() => {
				const newState = moveEpic(originalStoryMapState.current, epic.id, getTargetLocation(storyMapState))
				if (JSON.stringify(newState) !== JSON.stringify(storyMapState)) {
					if (!isUpdating.current) {
						setStoryMapState({productId, storyMapState: newState})
						isUpdating.current = true
					}
				} else {
					isUpdating.current = false
				}
			}}
			className={clsx(`grid justify-items-center gap-y-4`, features.length === 0 && `px-4`)}
			style={{gridTemplateColumns: `repeat(${features.length}, auto)`}}
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
				<EpicContent productId={productId} epic={epic} ref={contentRef} />
			</motion.div>

			{/* Pad out the remaining columns in row 1 */}
			{Array(Math.max(features.length - 1, 0))
				.fill(null)
				.map((_, i) => (
					<div key={`filler-${epic.id}-row1-${i}`} />
				))}

			{/* Pad out the beginning columns in row 2 */}
			{Array(Math.max(features.length - 1, 0))
				.fill(null)
				.map((_, i) => (
					<div key={`filler-${epic.id}-row2-${i}`} />
				))}

			<SmallAddFeatureButton productId={productId} epic={epic} />

			<FeatureList productId={productId} epic={epic} />
		</motion.div>
	)
}

export default Epic
