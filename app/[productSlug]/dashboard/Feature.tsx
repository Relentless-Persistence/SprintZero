"use client"

import {CopyOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import clsx from "clsx"
import {useCallback, useEffect, useState} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Feature as FeatureType} from "~/types/db/Features"

import Draggable from "./Draggable"
import ItemDrawer from "./ItemDrawer"
import Story from "./Story"
import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {addCommentToFeature, addStory, deleteFeature, updateFeature} from "~/utils/fetch"

export type FeatureProps = {
	epicId: Id
	feature: FeatureType
}

const Feature: FC<FeatureProps> = ({epicId, feature}) => {
	const activeProduct = useMainStore((state) => state.activeProduct)
	const currentVersion = useStoryMapStore((state) => state.currentVersion)
	const [featureName, setFeatureName] = useState(feature.name)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)
	const reportPendingDomChange = useStoryMapStore((state) => state.reportPendingDomChange)

	const stories = useStoryMapStore((state) => state.stories.filter((story) => story.feature === feature.id))
	const points = useStoryMapStore((state) =>
		state.stories.filter((story) => story.feature === feature.id).reduce((acc, story) => acc + story.points, 0),
	)

	const addStoryMutation = useMutation({
		mutationFn: addStory(activeProduct!, epicId, feature.id),
	})

	const updateFeatureMutation = useMutation({
		mutationKey: [`update-feature`, feature.id],
		mutationFn: updateFeature(feature.id),
	})
	const deleteFeatureMutation = useMutation({
		mutationKey: [`delete-feature`, feature.id],
		mutationFn: deleteFeature(feature.id),
	})
	const addCommentMutation = useMutation({
		mutationKey: [`add-comment`, feature.id],
		mutationFn: addCommentToFeature(feature.id),
	})

	useEffect(() => {
		updateFeature(feature.id)({name: featureName})
	}, [feature.id, featureName])

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(feature.id, node)
			reportPendingDomChange({type: `create`, id: feature.id})
		},
		[feature.id, registerElement, reportPendingDomChange],
	)

	return (
		<>
			<Draggable layer={1} id={feature.id}>
				<div className="flex flex-col items-center">
					<div
						className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378] transition-transform hover:scale-105"
						ref={ref}
					>
						<button type="button" onClick={() => void setIsDrawerOpen(true)} data-nondraggable>
							<CopyOutlined />
						</button>
						<Draggable.Input id={feature.id} value={featureName} onChange={(value) => void setFeatureName(value)} />
					</div>

					{(stories.length > 0 || currentVersion !== `__ALL_VERSIONS__`) && (
						<div className="mt-12 flex flex-col items-start gap-2 rounded-md border border-[#006378] bg-white p-2">
							{stories.map((story) => (
								<Story key={story.id} story={story} />
							))}
							{currentVersion !== `__ALL_VERSIONS__` && (
								<Button
									type="dashed"
									size="small"
									onClick={() =>
										void addStoryMutation.mutate({
											name: `story`,
											description: `description`,
											version: currentVersion,
										})
									}
									className="bg-white transition-colors hover:bg-[#f2fbfe]"
									style={{borderColor: `#006378`, color: `#006378`, fontSize: `0.75rem`}}
								>
									Add story
								</Button>
							)}
						</div>
					)}
				</div>
			</Draggable>

			<ItemDrawer
				title={feature.name}
				itemType="Feature"
				data={{
					points,
					description: feature.description,
					onDescriptionChange: (value) => void updateFeatureMutation.mutate({description: value}),
					comments: feature.comments,
					onCommentAdd: (comment, author, type) => void addCommentMutation.mutate({text: comment, author, type}),
					onDelete: () => {
						setIsDrawerOpen(false)
						reportPendingDomChange({type: `delete`, id: feature.id})
						deleteFeatureMutation.mutate()
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Feature