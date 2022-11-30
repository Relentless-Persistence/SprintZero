"use client"

import {useMutation, useQueryClient} from "@tanstack/react-query"
import {Drawer} from "antd5"
import TextArea from "antd5/es/input/TextArea"
import clsx from "clsx"
import {useCallback, useState} from "react"

import type {FC} from "react"
import type {Story as StoryType} from "~/types/db/Stories"
import type {Version} from "~/types/db/Versions"

import Draggable, {useIsHovering} from "./Draggable"
import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {updateStory} from "~/utils/fetch"

type Props = {
	story: StoryType
}

const Story: FC<Props> = ({story}) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)
	const isActive = useIsHovering(2, story.id)

	const activeProduct = useMainStore((state) => state.activeProduct)
	const version = useQueryClient()
		.getQueryData<Version[]>([`all-versions`, activeProduct])
		?.find((version) => version.id === story.version)

	const updateStoryMutation = useMutation({mutationFn: updateStory(story.id)})

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
				<div className={clsx(`rounded-md p-4 transition-colors`, isActive && `cursor-grab bg-[#00000008]`)}>
					<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-laurel bg-green-t1300 px-2 py-1 text-laurel">
						<button type="button" onClick={() => void setIsDrawerOpen(true)} data-nondraggable>
							{version?.name}
						</button>
						<Draggable.Input value={story.name} onChange={(value) => void updateStoryMutation.mutate({name: value})} />
					</div>
				</div>
			</Draggable>

			<Drawer
				title={story.name}
				placement="bottom"
				closable={false}
				open={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			>
				<p>Feature</p>
				<TextArea />
			</Drawer>
		</>
	)
}

export default Story
