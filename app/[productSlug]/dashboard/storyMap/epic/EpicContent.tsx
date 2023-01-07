import {ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {useAtomValue, useSetAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import {epicsAtom, storiesAtom} from "../atoms"
import AutoSizingInput from "../AutoSizingInput"
import ItemDrawer from "../ItemDrawer"
import {addCommentToEpic, deleteEpic, updateEpic} from "~/utils/api/mutations"

export type EpicContentProps = {
	epic: EpicType
}

const EpicContent: ForwardRefRenderFunction<HTMLDivElement, EpicContentProps> = ({epic}, ref) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const setEpic = useSetAtom(epicsAtom)
	const points = useAtomValue(storiesAtom)
		.filter((story) => story.epic === epic.id)
		.reduce((acc, story) => acc + story.points, 0)

	const updateEpicMutation = useMutation({mutationKey: [`update-epic`, epic.id], mutationFn: updateEpic(epic.id)})
	const addCommentMutation = useMutation({
		mutationKey: [`add-comment`, epic.id],
		mutationFn: addCommentToEpic(epic.id),
	})
	const deleteEpicMutation = useMutation({mutationKey: [`delete-epic`, epic.id], mutationFn: deleteEpic(epic.id)})

	const updateLocalEpic = (newName: string) => {
		setEpic((oldEpics) => {
			const index = oldEpics.findIndex((oldEpic) => oldEpic.id === epic.id)
			return [
				...oldEpics.slice(0, index),
				{
					...oldEpics[index]!,
					name: newName,
				},
				...oldEpics.slice(index + 1),
			]
		})
	}

	return (
		<>
			<div
				className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8]"
				ref={ref}
			>
				<button
					type="button"
					onClick={() => void setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => void e.stopPropagation()}
				>
					<ReadOutlined />
				</button>
				<AutoSizingInput
					value={epic.name}
					onChange={(value) => {
						updateLocalEpic(value)
						updateEpicMutation.mutate({name: value})
					}}
					inputStateId={epic.nameInputState}
					inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
				/>
			</div>

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
						deleteEpicMutation.mutate()
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(EpicContent)
