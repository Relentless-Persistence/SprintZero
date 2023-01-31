"use client"

import {CopyOutlined} from "@ant-design/icons"
import {motion, useMotionTemplate, useMotionValue} from "framer-motion"
import produce from "immer"
import {clamp, debounce} from "lodash"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Feature as FeatureType, StoryMapState} from "~/types/db/StoryMapStates"

import {matrixRect} from "../globals"
import {sortFeatures} from "~/app/[productSlug]/dashboard/storyMap/utils"
import {setStoryMapState} from "~/utils/api/mutations"

const debouncedSetStoryMapState = debounce(setStoryMapState, 100)

export type FeatureProps = {
	storyMapState: StoryMapState
	feature: FeatureType
}

const Feature: FC<FeatureProps> = ({feature, storyMapState}) => {
	const x = useMotionValue(feature.effort)
	const y = useMotionValue(feature.userValue)

	useEffect(() => {
		x.set(storyMapState.features.find(({id}) => id === feature.id)!.effort)
		y.set(storyMapState.features.find(({id}) => id === feature.id)!.userValue)
	}, [feature.id, storyMapState.features, x, y])

	const ref = useRef<HTMLDivElement | null>(null)
	const pointerOffset = useRef<[number, number]>([0, 0])
	const moveFeature = (x: number, y: number) => {
		const newStoryMapState = produce(storyMapState, (state) => {
			const newFeature = state.features.find(({id}) => id === feature.id)!
			newFeature.effort = x
			newFeature.userValue = y
			const host = state.epics.find(({featureIds}) => featureIds.includes(feature.id))!
			host.featureIds = sortFeatures(state, host.featureIds)
		})
		debouncedSetStoryMapState({id: newStoryMapState.id, data: newStoryMapState})
	}

	return (
		<motion.div
			key={feature.id}
			onPointerDown={(e) => {
				const boundingBox = ref.current!.getBoundingClientRect()
				const center = [boundingBox.left + boundingBox.width / 2, boundingBox.top + boundingBox.height / 2] as const
				pointerOffset.current = [e.clientX - center[0], e.clientY - center[1]]
			}}
			onPan={(e, info) => {
				let newX = (info.point.x - pointerOffset.current[0] - matrixRect.current.left) / matrixRect.current.width
				newX = clamp(newX, 0, 1)
				let newY = (info.point.y - pointerOffset.current[1] - matrixRect.current.top) / matrixRect.current.height
				newY = clamp(newY, 0, 1)

				x.set(newX)
				y.set(newY)
				moveFeature(newX, newY)
			}}
			className="absolute flex min-w-[4rem] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378]"
			style={{top: useMotionTemplate`calc(${y}% * 100)`, left: useMotionTemplate`calc(${x}% * 100)`}}
			ref={ref}
		>
			<CopyOutlined />
			<p>{feature.name}</p>
		</motion.div>
	)
}

export default Feature
