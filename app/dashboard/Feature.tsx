"use client"

import {CopyOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import clsx from "clsx"
import {useCallback, useState} from "react"

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
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)

	const stories = useStoryMapStore((state) =>
		state.stories.map((story) => story.story).filter((story) => story.feature === feature.id),
	)
	const points = useStoryMapStore((state) =>
		state.stories
			.filter((story) => story.story.feature === feature.id)
			.reduce((acc, story) => acc + story.story.points, 0),
	)

	const addStoryMutation = useMutation({
		mutationFn: addStory(activeProduct!, epicId, feature.id),
	})

	const updateFeatureMutation = useMutation({mutationFn: updateFeature(feature.id)})
	const deleteFeatureMutation = useMutation({mutationFn: deleteFeature(feature.id)})
	const addCommentMutation = useMutation({mutationFn: addCommentToFeature(feature.id)})

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(1, feature.id, node)
		},
		[feature.id, registerElement],
	)

	return (
		<>
			<Draggable layer={1} id={feature.id} ref={ref}>
				<div className="flex flex-col items-center rounded-md p-4 transition-colors">
					<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378]">
						<button type="button" onClick={() => void setIsDrawerOpen(true)} data-nondraggable>
							<CopyOutlined />
						</button>
						<Draggable.Input
							value={feature.name}
							onChange={(value) => void updateFeatureMutation.mutate({name: value})}
						/>
					</div>

					<div
						className={clsx(
							`flex flex-col items-start`,
							(stories.length > 0 || currentVersion !== `__ALL_VERSIONS__`) &&
								`mt-12 rounded-md border border-[#006378] bg-white p-1`,
						)}
					>
						{stories.map((story) => (
							<Story key={story.id} story={story} />
						))}
						{currentVersion !== `__ALL_VERSIONS__` && (
							<div className="p-2">
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
							</div>
						)}
					</div>
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
					onDelete: () => void deleteFeatureMutation.mutate(),
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Feature
