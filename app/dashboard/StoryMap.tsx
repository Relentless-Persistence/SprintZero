"use client"

import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import {useAnimationFrame} from "framer-motion"
import {useInterval} from "react-use"

import type {FC} from "react"

import Epic from "./Epic"
import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {addEpic} from "~/utils/fetch"

const StoryMap: FC = () => {
	const activeProductId = useMainStore((state) => state.activeProductId)

	const epics = useStoryMapStore((state) => Array.from(state.epics.values()).map((epic) => epic.epic))

	const addEpicMutation = useMutation({mutationFn: activeProductId ? addEpic(activeProductId) : async () => {}})

	const dividers = useStoryMapStore((state) => state.dividers)
	const calculateDividers = useStoryMapStore((state) => state.calculateDividers)
	useInterval(() => void calculateDividers(), 1000)

	return (
		<div className="flex w-max">
			<div className="flex gap-1">
				{epics.map((epic) => (
					<Epic key={epic!.id} epic={epic!} />
				))}
			</div>
			<div className="py-4 px-8">
				<Button
					onClick={() => void addEpicMutation.mutate({name: `Epic`, description: `description`})}
					className="bg-white"
				>
					Add epic
				</Button>
			</div>

			<div className="absolute inset-0">
				{dividers[0]?.map((divider) => (
					<div
						key={`divider-0-${divider.pos}`}
						className="absolute top-0 h-full w-px border-[1px] border-dashed border-[red]"
						style={{left: divider.pos}}
					/>
				))}
				{dividers[1]?.map((divider) => (
					<div
						key={`divider-1-${divider.pos}`}
						className="absolute top-0 h-full w-px border-[1px] border-dashed border-[green]"
						style={{left: divider.pos}}
					/>
				))}
				{dividers[2]?.map((divider) => (
					<div
						key={`divider-2-${divider.pos}`}
						className="absolute top-0 h-full w-px border-[1px] border-dashed border-[blue]"
						style={{left: divider.pos}}
					/>
				))}
			</div>
		</div>
	)
}

export default StoryMap
