"use client"

import {CopyOutlined} from "@ant-design/icons"
import {useAtomValue, useSetAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Feature as FeatureType} from "~/types/db/Features"

import {featuresAtom, storiesAtom} from "../atoms"
import AutoSizingInput from "../AutoSizingInput"
import ItemDrawer from "../ItemDrawer"
import {addCommentToFeature, deleteFeature, updateFeature} from "~/utils/api/mutations"

export type FeatureContentProps = {
	feature: FeatureType
}

const FeatureContent: ForwardRefRenderFunction<HTMLDivElement, FeatureContentProps> = ({feature}, ref) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const setFeatures = useSetAtom(featuresAtom)
	const stories = useAtomValue(storiesAtom).filter((story) => story.feature === feature.id)
	const points = stories.filter((story) => story.feature === feature.id).reduce((acc, story) => acc + story.points, 0)

	const updateLocalFeatureName = (newName: string) => {
		setFeatures((oldFeatures) => {
			const index = oldFeatures.findIndex((oldFeature) => oldFeature.id === feature.id)
			return [
				...oldFeatures.slice(0, index),
				{
					...oldFeatures[index]!,
					name: newName,
				},
				...oldFeatures.slice(index + 1),
			]
		})
	}

	return (
		<>
			<div
				className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378] transition-transform hover:scale-105"
				ref={ref}
			>
				<button
					type="button"
					onClick={() => void setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => void e.stopPropagation()}
				>
					<CopyOutlined />
				</button>
				<AutoSizingInput
					value={feature.name}
					onChange={(value) => {
						updateLocalFeatureName(value)
						updateFeature({featureId: feature.id, data: {name: value}})
					}}
					inputStateId={feature.nameInputState}
					inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
				/>
			</div>

			<ItemDrawer
				title={feature.name}
				itemType="Feature"
				data={{
					points,
					description: feature.description,
					onDescriptionChange: (value) => void updateFeature({featureId: feature.id, data: {description: value}}),
					comments: feature.comments,
					onCommentAdd: (comment, author, type) =>
						void addCommentToFeature({featureId: feature.id, comment: {text: comment, author, type}}),
					onDelete: () => {
						setIsDrawerOpen(false)
						deleteFeature({featureId: feature.id})
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(FeatureContent)
