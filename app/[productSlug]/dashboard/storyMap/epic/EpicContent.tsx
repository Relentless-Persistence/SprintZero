import {ReadOutlined} from "@ant-design/icons"
import produce from "immer"
import {useAtomValue, useSetAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Epic as EpicType} from "~/types/db/Products"

import {storyMapStateAtom} from "../atoms"
import AutoSizingInput from "../AutoSizingInput"
import ItemDrawer from "../ItemDrawer"
import {deleteEpic, updateEpic} from "~/utils/api/mutations"

export type EpicContentProps = {
	epic: EpicType
}

const EpicContent: ForwardRefRenderFunction<HTMLDivElement, EpicContentProps> = ({epic}, ref) => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const features = epic.featureIds.map((featureId) =>
		storyMapState.features.find((feature) => feature.id === featureId),
	)
	const stories = features
		.flatMap((feature) => feature?.storyIds)
		.map((storyId) => storyMapState.stories.find((story) => story.id === storyId))
	const points = stories.reduce((acc, story) => acc + (story?.points ?? 0), 0)

	const setStoryMapState = useSetAtom(storyMapStateAtom)
	const updateLocalEpicName = (newName: string) => {
		setStoryMapState((state) =>
			produce(state, (state) => {
				const index = state.epics.findIndex((oldEpic) => oldEpic.id === epic.id)
				state.epics[index]!.name = newName
			}),
		)
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
						updateLocalEpicName(value)
						updateEpic({storyMapState, epicId: epic.id, data: {name: value}})
					}}
					inputStateId={epic.nameInputStateId}
					inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
				/>
			</div>

			<ItemDrawer
				title={epic.name}
				itemType="Epic"
				data={{
					points,
					description: epic.description,
					onDescriptionChange: (value) => void updateEpic({storyMapState, epicId: epic.id, data: {description: value}}),
					checklist: {
						title: `Keepers`,
						items: [],
						onItemToggle: () => {},
					},
					commentIds: epic.commentIds,
					onCommentAdd: () => {},
					onDelete: () => {
						setIsDrawerOpen(false)
						deleteEpic({storyMapState, epicId: epic.id})
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(EpicContent)
