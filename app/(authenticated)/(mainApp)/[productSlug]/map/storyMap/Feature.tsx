import {CopyOutlined} from "@ant-design/icons"
import clsx from "clsx"
import {useEffect, useRef, useState} from "react"

import type {StoryMapMeta} from "./meta"
import type {FC} from "react"
import type {Id} from "~/types"

import {elementRegistry} from "./globals"
import {updateItem} from "~/utils/storyMap"

export type FeatureProps = {
	meta: StoryMapMeta
	featureId: Id
	inert?: boolean
}

const Feature: FC<FeatureProps> = ({meta, featureId, inert = false}) => {
	const feature = meta.features.find((feature) => feature.id === featureId)!

	const contentRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (inert || !contentRef.current) return
		elementRegistry[featureId] = contentRef.current
		return () => {
			if (!contentRef.current) return
			elementRegistry[featureId] = contentRef.current // eslint-disable-line react-hooks/exhaustive-deps
		}
	}, [featureId, inert])

	const [localFeatureName, setLocalFeatureName] = useState(feature.name)

	return (
		<div
			className={clsx(
				`flex min-w-[4rem] touch-none select-none items-center gap-2 rounded border border-current bg-white px-2 py-1 font-medium text-[#006378] active:cursor-grabbing`,
				inert ? `cursor-grabbing` : `cursor-grab`,
			)}
			ref={contentRef}
		>
			<CopyOutlined />
			<div className="relative min-w-[1rem]">
				<p>{localFeatureName || `_`}</p>
				<input
					value={localFeatureName}
					className="absolute inset-0"
					onChange={(e) => {
						setLocalFeatureName(e.target.value)
						updateItem(meta.storyMapState, feature.id, {name: e.target.value}, meta.allVersions).catch(console.error)
					}}
					onPointerDownCapture={(e) => e.stopPropagation()}
				/>
			</div>
		</div>
	)
}

export default Feature
