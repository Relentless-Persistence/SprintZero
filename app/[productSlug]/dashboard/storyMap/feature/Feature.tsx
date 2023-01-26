"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {Feature as FeatureType} from "~/types/db/Products"

import FeatureContent from "./FeatureContent"
import StoryList from "./StoryList"
import {currentVersionAtom} from "../atoms"
import {dragState, elementRegistry, storyMapMeta} from "../utils/globals"

export type FeatureProps = {
	feature: FeatureType
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({feature, inert = false}) => {
	const currentVersion = useAtomValue(currentVersionAtom)
	const featureMeta = storyMapMeta.current[feature.id]

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !containerRef.current || !contentRef.current) return
		elementRegistry[feature.id] = {
			container: containerRef.current,
			content: contentRef.current,
		}
		return () => {
			if (!containerRef.current || !contentRef.current) return
			elementRegistry[feature.id] = {
				container: containerRef.current, // eslint-disable-line react-hooks/exhaustive-deps
				content: contentRef.current, // eslint-disable-line react-hooks/exhaustive-deps
			}
		}
	}, [feature.id, inert])

	return (
		<motion.div
			layoutId={
				dragState.current?.id === featureMeta?.parent || dragState.current?.id === feature.id
					? undefined
					: `feature-${feature.id}`
			}
			layout={
				dragState.current?.id === featureMeta?.parent || dragState.current?.id === feature.id ? undefined : `position`
			}
			className={clsx(`flex flex-col items-center`, dragState.current?.id === feature.id && !inert && `invisible`)}
			ref={containerRef}
		>
			<div className="cursor-grab touch-none select-none transition-transform hover:scale-105" ref={contentRef}>
				<FeatureContent feature={feature} />
			</div>

			{(currentVersion.id !== `__ALL_VERSIONS__` || feature.storyIds.length > 0) && (
				<div className="h-8 w-px border border-dashed border-[#006378]" />
			)}

			<StoryList feature={feature} inert={inert} />
		</motion.div>
	)
}

export default Feature
