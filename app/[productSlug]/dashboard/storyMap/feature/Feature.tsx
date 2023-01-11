"use client"

import {motion} from "framer-motion"
import {useAtom, useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Feature as FeatureType} from "~/types/db/Products"

import {currentVersionAtom, dragStateAtom} from "../atoms"
import {elementRegistry} from "../utils"
import FeatureContent from "./FeatureContent"
import StoryList from "./StoryList"

export type FeatureProps = {
	productId: Id
	epicId: Id
	feature: FeatureType
}

const Feature: FC<FeatureProps> = ({productId, epicId, feature}) => {
	const [dragState, setDragState] = useAtom(dragStateAtom)
	const currentVersion = useAtomValue(currentVersionAtom)

	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		elementRegistry.features[feature.id] = containerRef.current
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			elementRegistry.features[feature.id] = containerRef.current
		}
	}, [feature.id])

	return (
		<motion.div
			layoutId={feature.id}
			layout="position"
			className="flex flex-col items-center"
			style={{
				x: dragState.id === feature.id && dragState.pos[0] ? dragState.pos[0] : `0px`,
				y: dragState.id === feature.id && dragState.pos[1] ? dragState.pos[1] : `0px`,
			}}
			ref={containerRef}
		>
			<motion.div
				onPointerDown={(e) => {
					e.preventDefault()
					setDragState((prev) => ({...prev, id: feature.id, type: `feature`}))
				}}
				className="-m-4 cursor-grab touch-none p-4 transition-transform hover:scale-105"
			>
				<FeatureContent productId={productId} epicId={epicId} feature={feature} />
			</motion.div>

			{(currentVersion.id !== `__ALL_VERSIONS__` || feature.stories.length > 0) && (
				<div className="h-10 w-px border border-dashed border-[#006378]" />
			)}

			<StoryList productId={productId} epicId={epicId} feature={feature} />
		</motion.div>
	)
}

export default Feature
