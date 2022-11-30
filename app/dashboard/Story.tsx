"use client"

import {useMutation, useQueryClient} from "@tanstack/react-query"
import {useCallback, useState} from "react"

import type {FC} from "react"
import type {Story as StoryType} from "~/types/db/Stories"
import type {Version} from "~/types/db/Versions"

import Draggable from "./Draggable"
import ItemDrawer from "./ItemDrawer"
import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {addCommentToStory, deleteStory, updateStory} from "~/utils/fetch"

type Props = {
	story: StoryType
}

const Story: FC<Props> = ({story}) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)

	const activeProduct = useMainStore((state) => state.activeProduct)
	const version = useQueryClient()
		.getQueryData<Version[]>([`all-versions`, activeProduct])
		?.find((version) => version.id === story.version)

	const updateStoryMutation = useMutation({mutationFn: updateStory(story.id)})
	const deleteStoryMutation = useMutation({mutationFn: deleteStory(story.id)})
	const addCommentMutation = useMutation({mutationFn: addCommentToStory(story.id)})

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(2, story.id, node)
		},
		[story.id, registerElement],
	)

	return (
		<>
			<Draggable layer={2} id={story.id} ref={ref}>
				<div className="rounded-md p-2 transition-colors">
					<div className="flex min-w-[4rem] items-center gap-1 overflow-hidden rounded border border-laurel bg-green-t1300 pr-1 text-laurel">
						<button
							type="button"
							onClick={() => void setIsDrawerOpen(true)}
							data-nondraggable
							className="border-r-[1px] border-laurel bg-green-t1200 p-0.5 text-[0.6rem]"
						>
							<p className="-rotate-90">{version?.name}</p>
						</button>
						<div className="text-xs text-black">
							<Draggable.Input
								value={story.name}
								onChange={(value) => void updateStoryMutation.mutate({name: value})}
							/>
						</div>
					</div>
				</div>
			</Draggable>

			<ItemDrawer
				title={story.name}
				itemType="User story"
				data={{
					points: story.points,
					description: story.description,
					onDescriptionChange: (value) => void updateStoryMutation.mutate({description: value}),
					checklist: {
						title: `Acceptance criteria`,
						items: story.acceptanceCriteria.map((item) => ({id: item.id, label: item.name, checked: item.checked})),
						onItemToggle: () => {},
					},
					comments: story.comments,
					onCommentAdd: (comment, author, type) => void addCommentMutation.mutate({text: comment, author, type}),
					onDelete: () => void deleteStoryMutation.mutate(),
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Story
