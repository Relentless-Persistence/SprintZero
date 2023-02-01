"use client"

import clsx from "clsx"
import {motion} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import FeatureContent from "./FeatureContent"
import StoryList from "./StoryList"
import {currentVersionAtom} from "../atoms"
import {dragState, elementRegistry, storyMapMeta} from "../utils/globals"

export type FeatureProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	featureId: string
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({activeProduct, storyMapState, featureId, inert = false}) => {
	const currentVersion = useAtomValue(currentVersionAtom)
	const feature = storyMapState.features.find((feature) => feature.id === featureId)!
	const featureMeta = storyMapMeta.current[featureId]

	const containerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !containerRef.current || !contentRef.current) return
		elementRegistry[featureId] = {
			container: containerRef.current,
			content: contentRef.current,
		}
		return () => {
			if (!containerRef.current || !contentRef.current) return
			elementRegistry[featureId] = {
				container: containerRef.current, // eslint-disable-line react-hooks/exhaustive-deps
				content: contentRef.current, // eslint-disable-line react-hooks/exhaustive-deps
			}
		}
	}, [featureId, inert])

	return (
		<motion.div
			layoutId={
				dragState.current?.id === featureMeta?.parent || dragState.current?.id === featureId
					? undefined
					: `feature-${featureId}`
			}
			layout={
				dragState.current?.id === featureMeta?.parent || dragState.current?.id === featureId ? undefined : `position`
			}
			className={clsx(`flex flex-col items-center`, dragState.current?.id === featureId && !inert && `invisible`)}
			ref={containerRef}
		>
			<div className="cursor-grab touch-none select-none transition-transform hover:scale-105" ref={contentRef}>
				<FeatureContent feature={feature} />
			</div>

			{(currentVersion.id !== `__ALL_VERSIONS__` || feature.storyIds.length > 0) && (
				<div className="h-8 w-px border border-dashed border-[#006378]" />
			)}

			<StoryList activeProduct={activeProduct} storyMapState={storyMapState} featureId={featureId} inert={inert} />
		</motion.div>
	)
}

export default Feature
