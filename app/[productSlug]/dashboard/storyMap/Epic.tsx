"use client"

import {CopyOutlined, PlusOutlined, ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import clsx from "clsx"
import {useAtomValue, useSetAtom} from "jotai"
import {useCallback, useEffect, useState} from "react"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import {featuresAtom, registerElementAtom, reportPendingDomChangeAtom, storiesAtom} from "./atoms"
import Draggable from "./Draggable"
import Feature from "./Feature"
import ItemDrawer from "./ItemDrawer"
import {addCommentToEpic, addFeature, deleteEpic, updateEpic} from "~/utils/fetch"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type EpicProps = {
	epic: EpicType
}

const Epic: FC<EpicProps> = ({epic}) => {
	const activeProduct = useActiveProductId()
	const [epicName, setEpicName] = useState(epic.name)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useSetAtom(registerElementAtom)
	const reportPendingDomChange = useSetAtom(reportPendingDomChangeAtom)

	const features = useAtomValue(featuresAtom).filter((feature) => feature.epic === epic.id)
	const points = useAtomValue(storiesAtom)
		.filter((story) => story.epic === epic.id)
		.reduce((acc, story) => acc + story.points, 0)

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
			registerElement({id: epic.id, element: node})
			reportPendingDomChange({type: `create`, id: epic.id})
		},
		[epic.id, registerElement, reportPendingDomChange],
	)

	return (
		<>
			<Draggable layer={0} id={epic.id}>
				<div
					className="grid justify-items-center gap-4"
					style={{gridTemplateColumns: `repeat(${features.length}, auto)`}}
				>
					<div
						className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8] transition-transform hover:scale-105"
						ref={ref}
					>
						<button type="button" onClick={() => void setIsDrawerOpen(true)} data-nondraggable>
							<ReadOutlined />
						</button>
						<Draggable.Input id={epic.id} value={epicName} onChange={(value) => void setEpicName(value)} />
					</div>

					{/* Pad out the remaining columns in row 1 */}
					{Array(Math.max(features.length - 1, 0)).fill(<div />)}

					{/* Pad out the beginning columns in row 2 */}
					{Array(Math.max(features.length - 1, 0)).fill(<div />)}

					<button
						type="button"
						onClick={() => void addFeatureMutation.mutate(`Feature`)}
						className={clsx(
							`grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white`,
							features.length === 0 && `invisible`,
						)}
					>
						<PlusOutlined />
					</button>

					{features.map((feature) => (
						<Feature key={feature.id} epicId={epic.id} feature={feature} />
					))}
					{features.length === 0 && (
						<Button
							type="dashed"
							onClick={() => void addFeatureMutation.mutate(`Feature`)}
							className="flex items-center bg-white transition-colors hover:bg-[#f2fbfe]"
							style={{borderColor: `#006378`, color: `#006378`, padding: `0.25rem 0.5rem`}}
						>
							<CopyOutlined />
							<span>Add feature</span>
						</Button>
					)}
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
