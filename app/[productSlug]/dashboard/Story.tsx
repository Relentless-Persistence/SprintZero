"use client"

import {useMutation, useQueryClient} from "@tanstack/react-query"
import {useCallback, useEffect, useState} from "react"

import type {FC} from "react"
import type {Story as StoryType} from "~/types/db/Stories"
import type {Version} from "~/types/db/Versions"

import Draggable from "./Draggable"
import ItemDrawer from "./ItemDrawer"
import {useStoryMapStore} from "./storyMapStore"
import {addCommentToStory, deleteStory, updateStory} from "~/utils/fetch"
import {useActiveProductId} from "~/utils/useActiveProductSlug"

type Props = {
	story: StoryType
}

const Story: FC<Props> = ({story}) => {
	const [storyName, setStoryName] = useState(story.name)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)
	const reportPendingDomChange = useStoryMapStore((state) => state.reportPendingDomChange)

	const activeProduct = useActiveProductId()
	const version = useQueryClient()
		.getQueryData<Version[]>([`all-versions`, activeProduct])
		?.find((version) => version.id === story.version)

	const updateStoryMutation = useMutation({mutationKey: [`update-story`, story.id], mutationFn: updateStory(story.id)})
	const deleteStoryMutation = useMutation({mutationKey: [`delete-story`, story.id], mutationFn: deleteStory(story.id)})
	const addCommentMutation = useMutation({
		mutationKey: [`add-comment`, story.id],
		mutationFn: addCommentToStory(story.id),
	})

	useEffect(() => {
		updateStory(story.id)({name: storyName})
	}, [story.id, storyName])

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(story.id, node)
			reportPendingDomChange({type: `create`, id: story.id})
		},
		[story.id, registerElement, reportPendingDomChange],
	)

	return (
		<>
			<Draggable layer={2} id={story.id} ref={ref}>
				<div className="flex min-w-[4rem] items-center gap-1 overflow-hidden rounded border border-laurel bg-green-t1300 pr-1 text-laurel transition-transform hover:scale-105">
					<button
						type="button"
						onClick={() => void setIsDrawerOpen(true)}
						data-nondraggable
						className="border-r-[1px] border-laurel bg-green-t1200 p-0.5 text-[0.6rem]"
					>
						<p className="-rotate-90">{version?.name}</p>
					</button>
					<div className="mx-auto text-xs text-black">
						<Draggable.Input id={story.id} value={storyName} onChange={(value) => void setStoryName(value)} />
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
					onDelete: () => {
						setIsDrawerOpen(false)
						reportPendingDomChange({type: `delete`, id: story.id})
						deleteStoryMutation.mutate()
					},
				}}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Story
