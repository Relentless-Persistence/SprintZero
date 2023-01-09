"use client"

import clsx from "clsx"
import {motion, useDragControls} from "framer-motion"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Feature as FeatureType} from "~/types/db/Products"

import {useGetEpic} from "../atoms"
import {avg, elementRegistry, pointerOffset} from "../utils"
import FeatureContent from "./FeatureContent"
import StoryList from "./StoryList"

export type FeatureProps = {
	productId: Id
	epicId: Id
	feature: FeatureType
}

const Feature: FC<FeatureProps> = ({productId, epicId, feature}) => {
	const dragControls = useDragControls()

	const features = useGetEpic(epicId).features
	const featureIndex = features.findIndex(({id}) => id === feature.id)

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

	return (
		<motion.div
			layoutId={feature.id}
			layout="position"
			drag
			dragControls={dragControls}
			whileDrag="grabbing"
			dragListener={false}
			dragSnapToOrigin
			onPointerDown={(e) => {
				e.stopPropagation()
				const contentRect = contentRef.current!.getBoundingClientRect()
				pointerOffset.current = [e.clientX - avg(contentRect.left, contentRect.right), 0]
			}}
			onDragEnd={() => void (pointerOffset.current = null)}
			className={clsx(
				`flex flex-col items-center gap-12`,
				featureIndex === 0 ? `pl-4` : `pl-2`,
				featureIndex === features.length - 1 ? `pr-4` : `pr-2`,
			)}
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
				<FeatureContent productId={productId} epicId={epicId} feature={feature} ref={contentRef} />
			</motion.div>

			<StoryList productId={productId} epicId={epicId} feature={feature} />
		</motion.div>
	)
}

export default Feature
