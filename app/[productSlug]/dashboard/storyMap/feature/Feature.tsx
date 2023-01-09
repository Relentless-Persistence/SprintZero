"use client"

import clsx from "clsx"
import {motion, useDragControls} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Feature as FeatureType} from "~/types/db/Features"

import {storyMapStateAtom} from "../atoms"
import {elementRegistry, featureDividers} from "../utils"
import FeatureContent from "./FeatureContent"
import StoryList from "./StoryList"

export type FeatureProps = {
	feature: FeatureType
}

const Feature: FC<FeatureProps> = ({feature}) => {
	const dragControls = useDragControls()

	const storyMapState = useAtomValue(storyMapStateAtom)
	const featuresOrder = storyMapState.find(({epic}) => epic === feature.epic)!.featuresOrder
	const featureIndex = featuresOrder.findIndex(({feature: featureId}) => featureId === feature.id)

	const contentRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		elementRegistry.features[feature.id] = {
			content: contentRef.current,
			container: containerRef.current,
		}
		return () => {
			elementRegistry.features[feature.id] = {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				content: contentRef.current,
				// eslint-disable-next-line react-hooks/exhaustive-deps
				container: containerRef.current,
			}
		}
	}, [feature.id])

	const startPos = useRef(0)

	return (
		<motion.div
			layoutId={feature.id}
			layout="position"
			drag
			dragControls={dragControls}
			dragListener={false}
			dragSnapToOrigin
			onPointerDown={() => void (startPos.current = featureDividers[feature.id]!.center)}
			// onDrag={(e, info) => {
			// 	if (prevEpic !== null) {
			// 		const prevEpicPosition = epicDividers[prevEpic]!
			// 		if (info.offset.x < prevEpicPosition - startPos.current)
			// 			moveEpicTo({productId: activeProductId!, epicId: epic.id, position: epicIndex - 1})
			// 	}
			// 	if (nextEpic !== null) {
			// 		const nextEpicPosition = epicDividers[nextEpic]!
			// 		if (info.offset.x > nextEpicPosition - startPos.current)
			// 			moveEpicTo({productId: activeProductId!, epicId: epic.id, position: epicIndex + 1})
			// 	}
			// }}
			className={clsx(
				`flex flex-col items-center gap-12`,
				featureIndex === 0 ? `pl-4` : `pl-2`,
				featureIndex === featuresOrder.length - 1 ? `pr-4` : `pr-2`,
			)}
			ref={containerRef}
		>
			<div
				onPointerDown={(e) => {
					e.preventDefault()
					dragControls.start(e)
				}}
				className="-m-4 cursor-grab touch-none p-4 transition-transform hover:scale-105"
			>
				<FeatureContent feature={feature} />
			</div>

			<StoryList feature={feature} />
		</motion.div>
	)
}

export default Feature
