"use client"

import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"

import type {FC} from "react"

import Epic from "./Epic"
import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {addEpic} from "~/utils/fetch"

const StoryMap: FC = () => {
	const activeProductId = useMainStore((state) => state.activeProductId)

	const epics = useStoryMapStore((state) => Array.from(state.epics.values()).map((epic) => epic.epic))

	const addEpicMutation = useMutation({mutationFn: activeProductId ? addEpic(activeProductId) : async () => {}})

	return (
		<div className="flex w-max">
			<div className="flex gap-1">
				{epics.map((epic) => (
					<Epic key={epic!.id} epic={epic!} />
				))}
			</div>
			<div className="p-8">
				<Button
					onClick={() => void addEpicMutation.mutate({name: `Epic`, description: `description`})}
					className="bg-white"
				>
					Add epic
				</Button>
			</div>
		</div>
	)
}

export default StoryMap
