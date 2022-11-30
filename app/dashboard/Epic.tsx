"use client"

import {ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import clsx from "clsx"
import {useCallback, useState} from "react"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import Draggable, {useIsHovering} from "./Draggable"
import ItemDrawer from "./ItemDrawer"
import {useStoryMapStore} from "./storyMapStore"
import Feature from "~/app/dashboard/Feature"
import useMainStore from "~/stores/mainStore"
import {addCommentToEpic, addFeature, deleteEpic, updateEpic} from "~/utils/fetch"

export type EpicProps = {
	epic: EpicType
}

const Epic: FC<EpicProps> = ({epic}) => {
	const activeProduct = useMainStore((state) => state.activeProduct)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)
	const isActive = useIsHovering(0, epic.id)

	const features = useStoryMapStore((state) =>
		state.features.map((feature) => feature.feature).filter((feature) => feature.epic === epic.id),
	)
	const points = useStoryMapStore((state) =>
		state.stories.filter((story) => story.story.epic === epic.id).reduce((acc, story) => acc + story.story.points, 0),
	)

	const addFeatureMutation = useMutation({
		mutationFn: addFeature(activeProduct!, epic.id),
	})

	const updateEpicMutation = useMutation({mutationFn: updateEpic(epic.id)})
	const addCommentMutation = useMutation({mutationFn: addCommentToEpic(epic.id)})
	const deleteEpicMutation = useMutation({mutationFn: deleteEpic(epic.id)})

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(0, epic.id, node)
		},
		[epic.id, registerElement],
	)

	return (
		<>
			<Draggable layer={0} id={epic.id} ref={ref}>
				<div
					className={clsx(
						`flex flex-col items-center gap-4 rounded-md p-4 transition-colors`,
						isActive && `cursor-grab bg-[#00000008]`,
					)}
				>
					<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8]">
						<button type="button" onClick={() => void setIsDrawerOpen(true)} data-nondraggable>
							<ReadOutlined />
						</button>
						<Draggable.Input
							value={epic.name}
							onChange={useCallback((value) => void updateEpicMutation.mutate({name: value}), [updateEpicMutation])}
						/>
					</div>
					<div className="flex items-center">
						<div className="flex gap-1">
							{features.map((feature) => (
								<Feature key={feature.id} epicId={epic.id} feature={feature} />
							))}
							<div className="p-4">
								<Button
									onClick={() => void addFeatureMutation.mutate({name: `feature`, description: `description`})}
									className="bg-white"
								>
									Add feature
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Draggable>

			<ItemDrawer
				title={epic.name}
				itemType="Epic"
				data={{
					points,
					description: epic.description,
					onDescriptionChange: (value) => void updateEpicMutation.mutate({description: value}),
					checklist: {
						title: `Keepers`,
						items: [],
						onItemToggle: () => {},
					},
					comments: epic.comments,
					onCommentAdd: (comment, author, type) => void addCommentMutation.mutate({text: comment, author, type}),
					onDelete: () => void deleteEpicMutation.mutate(),
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Epic
