"use client"

import {motion, useDragControls} from "framer-motion"
import {useAtomValue} from "jotai"
import {useLayoutEffect, useRef} from "react"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import {featuresAtom, storyMapStateAtom} from "../atoms"
import {elementRegistry, epicDividers} from "../utils"
import EpicContent from "./EpicContent"
import FeatureList from "./FeatureList"
import SmallAddFeatureButton from "./SmallAddFeatureButton"

export type EpicProps = {
	epic: EpicType
}

const Epic: FC<EpicProps> = ({epic}) => {
	const dragControls = useDragControls()

	const storyMapState = useAtomValue(storyMapStateAtom)
	const features = useAtomValue(featuresAtom).filter((feature) => feature.epic === epic.id)
	const epicIndex = storyMapState.findIndex(({epic: epicId}) => epicId === epic.id)
	const prevEpic = epicIndex > 0 ? storyMapState[epicIndex - 1]!.epic : null
	const nextEpic = epicIndex < storyMapState.length - 1 ? storyMapState[epicIndex + 1]!.epic : null

	const ref = useRef<HTMLDivElement>(null)
	useLayoutEffect(() => {
		elementRegistry.epics[epic.id] = ref.current
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			elementRegistry.epics[epic.id] = ref.current
		}
	}, [epic.id])

	return (
		<motion.div
			drag
			dragControls={dragControls}
			dragListener={false}
			dragSnapToOrigin
			onDrag={(e, info) => {
				const currentEpicDividers = epicDividers[epic.id]!
				const currentEpicWidth = currentEpicDividers.right - currentEpicDividers.left
				if (prevEpic !== null) {
					const prevEpicDividers = epicDividers[prevEpic]!
					const prevEpicWidth = prevEpicDividers.right - prevEpicDividers.left
					if (
						info.offset.x <
						prevEpicDividers.left + prevEpicWidth / 2 - currentEpicDividers.left - currentEpicWidth / 2
					)
						console.log(`move left`)
				}
				if (nextEpic !== null) {
					const nextEpicDividers = epicDividers[nextEpic]!
					const nextEpicWidth = nextEpicDividers.right - nextEpicDividers.left
					if (
						info.offset.x >
						nextEpicDividers.left + nextEpicWidth / 2 - currentEpicDividers.left - currentEpicWidth / 2
					)
						console.log(`move right`)
				}
			}}
			className="grid justify-items-center gap-4"
			style={{gridTemplateColumns: `repeat(${features.length}, auto)`}}
		>
			<div
				onPointerDown={(e) => void dragControls.start(e)}
				className="-m-4 cursor-grab p-4 transition-transform hover:scale-105"
			>
				<EpicContent epic={epic} ref={ref} />
			</div>

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

			<SmallAddFeatureButton epic={epic} />

			<FeatureList epic={epic} />
		</motion.div>
	)
}

export default Epic
