"use client"

import {useQueryClient} from "@tanstack/react-query"
import produce from "immer"
import {useAtomValue, useSetAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Story as StoryType} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import {storyMapStateAtom} from "../atoms"
import AutoSizingInput from "../AutoSizingInput"
import ItemDrawer from "../ItemDrawer"
import {deleteStory, updateStory} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type StoryContentProps = {
	story: StoryType
}

const StoryContent: ForwardRefRenderFunction<HTMLDivElement, StoryContentProps> = ({story}, ref) => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const activeProduct = useActiveProductId()
	const version = useQueryClient()
		.getQueryData<Version[]>([`all-versions`, activeProduct])
		?.find((version) => version.id === story.versionId)

	const setStoryMapState = useSetAtom(storyMapStateAtom)
	const updateLocalStoryName = (newName: string) => {
		setStoryMapState((state) =>
			produce(state, (state) => {
				state.stories.find(({id}) => id === story.id)!.name = newName
			}),
		)
	}

	return (
		<>
			<div
				className="flex min-w-[4rem] items-center gap-1 overflow-hidden rounded border border-laurel bg-green-t1300 pr-1 text-laurel"
				ref={ref}
			>
				<button
					type="button"
					onClick={() => void setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => void e.stopPropagation()}
					className="border-r-[1px] border-laurel bg-green-t1200 p-0.5 text-[0.6rem]"
				>
					<p className="-rotate-90">{version?.name}</p>
				</button>
				<div className="mx-auto px-1 text-xs text-black">
					<AutoSizingInput
						value={story.name}
						onChange={(value) => {
							updateLocalStoryName(value)
							updateStory({storyMapState, storyId: story.id, data: {name: value}})
						}}
						inputStateId={story.nameInputStateId}
						inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
					/>
				</div>
			</div>

			<ItemDrawer
				title={story.name}
				itemType="User story"
				data={{
					points: story.points,
					description: story.description,
					onDescriptionChange: (value) =>
						void updateStory({storyMapState, storyId: story.id, data: {description: value}}),
					checklist: {
						title: `Acceptance criteria`,
						items: story.acceptanceCriteria.map((item) => ({id: item.id, label: item.name, checked: item.checked})),
						onItemToggle: () => {},
					},
					commentIds: story.commentIds,
					onCommentAdd: () => {},
					onDelete: () => {
						setIsDrawerOpen(false)
						deleteStory({storyMapState, storyId: story.id})
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(StoryContent)
