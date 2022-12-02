"use client"

import {CopyOutlined, ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import {useCallback, useEffect, useState} from "react"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import Draggable from "./Draggable"
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
	const [epicName, setEpicName] = useState(epic.name)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)
	const reportPendingDomChange = useStoryMapStore((state) => state.reportPendingDomChange)

	const features = useStoryMapStore((state) => state.features.filter((feature) => feature.epic === epic.id))
	const points = useStoryMapStore((state) =>
		state.stories.filter((story) => story.epic === epic.id).reduce((acc, story) => acc + story.points, 0),
	)

	const addFeatureMutation = useMutation({
		mutationFn: addFeature(activeProduct!, epic.id),
	})

	const updateEpicMutation = useMutation({mutationKey: [`update-epic`, epic.id], mutationFn: updateEpic(epic.id)})
	const addCommentMutation = useMutation({mutationKey: [`add-comment`, epic.id], mutationFn: addCommentToEpic(epic.id)})
	const deleteEpicMutation = useMutation({mutationKey: [`delete-epic`, epic.id], mutationFn: deleteEpic(epic.id)})

	useEffect(() => {
		updateEpic(epic.id)({name: epicName})
	}, [epic.id, epicName])

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(epic.id, node)
			reportPendingDomChange({type: `create`, id: epic.id})
		},
		[epic.id, registerElement, reportPendingDomChange],
	)

	return (
		<>
			<Draggable layer={0} id={epic.id} ref={ref}>
				<div className="flex flex-col items-center gap-6 rounded-md p-4 transition-colors">
					<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8] transition-transform hover:scale-105">
						<button type="button" onClick={() => void setIsDrawerOpen(true)} data-nondraggable>
							<ReadOutlined />
						</button>
						<Draggable.Input id={epic.id} value={epicName} onChange={(value) => void setEpicName(value)} />
					</div>
					<div className="flex items-center">
						<div className="flex gap-1">
							{features.map((feature) => (
								<Feature key={feature.id} epicId={epic.id} feature={feature} />
							))}
							<div className="p-4">
								<Button
									type="dashed"
									onClick={() => void addFeatureMutation.mutate({name: `feature`, description: `description`})}
									className="flex items-center bg-white transition-colors hover:bg-[#f2fbfe]"
									style={{borderColor: `#006378`, color: `#006378`, padding: `0.25rem 0.5rem`}}
								>
									<CopyOutlined />
									<span>Add feature</span>
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
					onDelete: () => {
						setIsDrawerOpen(false)
						reportPendingDomChange({type: `delete`, id: epic.id})
						deleteEpicMutation.mutate()
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Epic
