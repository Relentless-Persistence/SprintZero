"use client"

import {CopyOutlined} from "@ant-design/icons"
import produce from "immer"
import {useSetAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Id} from "~/types"
import type {Feature as FeatureType} from "~/types/db/Products"

import {storyMapStateAtom, useGetFeature} from "../atoms"
import AutoSizingInput from "../AutoSizingInput"
import ItemDrawer from "../ItemDrawer"
import {deleteFeature, updateFeature} from "~/utils/api/mutations"

export type FeatureContentProps = {
	productId: Id
	epicId: Id
	feature: FeatureType
}

const FeatureContent: ForwardRefRenderFunction<HTMLDivElement, FeatureContentProps> = (
	{productId, epicId, feature},
	ref,
) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const stories = useGetFeature(epicId, feature.id).stories
	const points = stories.reduce((acc, story) => acc + story.points, 0)

	const setStoryMapState = useSetAtom(storyMapStateAtom)
	const updateLocalFeatureName = (newName: string) => {
		setStoryMapState((state) =>
			produce(state, (state) => {
				const epicIndex = state.epics.findIndex((epic) => epic.id === epicId)
				const featureIndex = state.epics[epicIndex]!.features.findIndex((f) => f.id === feature.id)
				state.epics[epicIndex]!.features[featureIndex]!.name = newName
			}),
		)
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
						updateFeature({productId, epicId, featureId: feature.id, data: {name: value}})
					}}
					inputStateId={feature.nameInputStateId}
					inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
				/>
			</div>

			<ItemDrawer
				title={feature.name}
				itemType="Feature"
				data={{
					points,
					description: feature.description,
					onDescriptionChange: (value) =>
						void updateFeature({productId, epicId, featureId: feature.id, data: {description: value}}),
					comments: feature.comments,
					onCommentAdd: () => {},
					onDelete: () => {
						setIsDrawerOpen(false)
						deleteFeature({productId, epicId, featureId: feature.id})
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(FeatureContent)
