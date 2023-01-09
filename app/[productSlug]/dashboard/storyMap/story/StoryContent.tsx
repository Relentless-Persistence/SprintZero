"use client"

import {useQueryClient} from "@tanstack/react-query"
import {useSetAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Story as StoryType} from "~/types/db/Stories"
import type {Version} from "~/types/db/Versions"

import {storiesAtom} from "../atoms"
import AutoSizingInput from "../AutoSizingInput"
import ItemDrawer from "../ItemDrawer"
import {addCommentToStory, deleteStory, updateStory} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type StoryContentProps = {
	story: StoryType
}

const StoryContent: ForwardRefRenderFunction<HTMLDivElement, StoryContentProps> = ({story}, ref) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const activeProduct = useActiveProductId()
	const version = useQueryClient()
		.getQueryData<Version[]>([`all-versions`, activeProduct])
		?.find((version) => version.id === story.version)
	const setStories = useSetAtom(storiesAtom)

	const updateLocalStoryName = (newName: string) => {
		setStories((oldStories) => {
			const index = oldStories.findIndex((oldStory) => oldStory.id === story.id)
			return [
				...oldStories.slice(0, index),
				{
					...oldStories[index]!,
					name: newName,
				},
				...oldStories.slice(index + 1),
			]
		})
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
							updateStory({storyId: story.id, data: {name: value}})
						}}
						inputStateId={story.nameInputState}
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
					onDescriptionChange: (value) => void updateStory({storyId: story.id, data: {description: value}}),
					checklist: {
						title: `Acceptance criteria`,
						items: story.acceptanceCriteria.map((item) => ({id: item.id, label: item.name, checked: item.checked})),
						onItemToggle: () => {},
					},
					comments: story.comments,
					onCommentAdd: (comment, author, type) =>
						void addCommentToStory({storyId: story.id, comment: {text: comment, author, type}}),
					onDelete: () => {
						setIsDrawerOpen(false)
						deleteStory({storyId: story.id})
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(StoryContent)
