"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtom, useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Feature as FeatureType} from "~/types/db/Products"

import {currentVersionAtom, dragStateAtom} from "../atoms"
import {elementRegistry, layerBoundaries} from "../utils/globals"
import FeatureContent from "./FeatureContent"
import StoryList from "./StoryList"

export type FeatureProps = {
	productId: Id
	epicId: Id
	feature: FeatureType
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({productId, epicId, feature, inert = false}) => {
	const [dragState, setDragState] = useAtom(dragStateAtom)
	const currentVersion = useAtomValue(currentVersionAtom)

	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert) return
		elementRegistry.features[feature.id] = containerRef.current ?? undefined
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			elementRegistry.features[feature.id] = containerRef.current ?? undefined
		}
	}, [feature.id, inert])

	return (
		<motion.div
			layoutId={dragState.id === epicId || dragState.id === feature.id ? undefined : `feature-${feature.id}`}
			layout="position"
			className={clsx(`flex flex-col items-center`, dragState.id === feature.id && !inert && `invisible`)}
			ref={containerRef}
		>
			<motion.div
				onPointerDown={(e) => void e.preventDefault()}
				onPanStart={(e, info) =>
					void setDragState((prev) => ({
						...prev,
						id: feature.id,
						type: `feature`,
						yOffset: info.point.y - layerBoundaries[0],
					}))
				}
				className="-m-4 cursor-grab touch-none p-4 transition-transform hover:scale-105"
			>
				<FeatureContent productId={productId} epicId={epicId} feature={feature} />
			</motion.div>

			{(currentVersion.id !== `__ALL_VERSIONS__` || feature.stories.length > 0) && (
				<div className="h-8 w-px border border-dashed border-[#006378]" />
			)}

			<StoryList productId={productId} epicId={epicId} feature={feature} inert={inert} />
		</motion.div>
	)
}

export default Feature
