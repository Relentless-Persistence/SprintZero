import {useMutation, useQuery} from "@tanstack/react-query"
import {Drawer} from "antd5"
import TextArea from "antd5/es/input/TextArea"
import clsx from "clsx"
import {useCallback, useState} from "react"

import type {FC} from "react"
import type {Story as StoryType} from "~/types/db/Stories"

import Draggable from "./Draggable"
import {useStoryMapStore} from "./storyMapStore"
import {getVersion, renameStory} from "~/utils/fetch"

type Props = {
	story: StoryType
}

const Story: FC<Props> = ({story}) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [isActive, setIsActive] = useState(false)
	const registerElement = useStoryMapStore((state) => state.registerElement)

	const {data: version} = useQuery({queryKey: [`version`, story.version], queryFn: getVersion(story.version)})

	const renameStoryMutation = useMutation({mutationFn: renameStory(story.id)})

	const ref = useCallback(
		(node: HTMLDivElement | null) => {
			if (!node) return
			registerElement(2, story.id, node)
		},
		[story.id, registerElement],
	)

	return (
		<>
			<Draggable onActiveStart={() => void setIsActive(true)} onActiveEnd={() => void setIsActive(false)} ref={ref}>
				<div className={clsx(`rounded-md p-4 transition-colors`, isActive && `cursor-grab bg-[#00000022]`)}>
					<div className="flex min-w-[4rem] items-center gap-2 rounded-md border border-laurel bg-green-t1300 px-2 py-1 text-laurel">
						<button type="button" onClick={() => void setIsDrawerOpen(true)}>
							{version?.name}
						</button>
						<Draggable.Input value={story.name} onChange={(value) => void renameStoryMutation.mutate(value)} />
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
