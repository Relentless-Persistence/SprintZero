import {CopyOutlined, MinusCircleOutlined} from "@ant-design/icons"
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
	isInitialRender?: boolean
}

const Feature: FC<FeatureProps> = ({meta, featureId, inert = false, isInitialRender = false}) => {
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
	useEffect(() => {
		setLocalFeatureName(feature.name)
	}, [feature.name])

	const [hasBlurred, setHasBlurred] = useState(isInitialRender)

	return (
		<div
			className={clsx(
				`flex min-w-[4rem] touch-none select-none items-center gap-2 rounded border border-current bg-white px-2 py-1 font-medium text-[#006378] dark:bg-black`,
				inert && `cursor-grabbing`,
				!meta.editMode && `cursor-grab active:cursor-grabbing`,
			)}
			ref={contentRef}
		>
			<CopyOutlined />
			{(hasBlurred || inert) && !meta.editMode ? (
				<p className="my-1 h-[1em]">{localFeatureName}</p>
			) : (
				<div className="relative my-1 min-w-[1rem]">
					<p>{localFeatureName || `_`}</p>
					<input
						value={localFeatureName}
						autoFocus={!isInitialRender && !meta.editMode}
						onBlur={() => setHasBlurred(true)}
						onKeyDown={(e) => {
							if (e.key === `Enter`) setHasBlurred(true)
						}}
						className="absolute inset-0 bg-transparent"
						onChange={(e) => {
							setLocalFeatureName(e.target.value)
							updateItem(meta.storyMapState, feature.id, {name: e.target.value}, meta.allVersions).catch(console.error)
						}}
						onPointerDownCapture={(e) => e.stopPropagation()}
					/>
				</div>
			)}
			{meta.editMode && (
				<button
					type="button"
					onClick={() => {
						meta.markForDeletion(featureId)
						feature.childrenIds.forEach((storyId) => meta.markForDeletion(storyId))
					}}
				>
					<MinusCircleOutlined className="text-sm text-error" />
				</button>
			)}
		</div>
	)
}

export default Feature
