"use client"

import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"

import type {FC} from "react"

import Epic from "./Epic"
import {useStoryMapStore} from "./storyMapStore"
import useMainStore from "~/stores/mainStore"
import {addEpic} from "~/utils/fetch"

const layerBoundaries = [62, 124]

const StoryMap: FC = () => {
	const activeProductId = useMainStore((state) => state.activeProductId)

	const epics = useStoryMapStore((state) => Array.from(state.epics.values()).map((epic) => epic.epic))

	const addEpicMutation = useMutation({mutationFn: activeProductId ? addEpic(activeProductId) : async () => {}})

	const dividers = useStoryMapStore((state) => state.dividers)

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

			<div className="pointer-events-none absolute inset-0">
				<div className="absolute w-full" style={{height: `${layerBoundaries[0]}px`, top: `0px`}}>
					{dividers[0]?.map((divider) => (
						<div
							key={`divider-0-${divider.pos}`}
							className="absolute top-0 h-full w-px border-[1px] border-dashed border-[red]"
							style={{left: divider.pos}}
						/>
					))}
				</div>
				<div
					className="absolute w-full"
					style={{height: `${(layerBoundaries[1] ?? 0) - (layerBoundaries[0] ?? 0)}px`, top: `${layerBoundaries[0]}px`}}
				>
					{dividers[1]?.map((divider) => (
						<div
							key={`divider-1-${divider.pos}`}
							className="absolute top-0 h-full w-px border-[1px] border-dashed border-[green]"
							style={{left: divider.pos}}
						/>
					))}
				</div>
				<div className="absolute w-full" style={{height: `300px`, top: `${layerBoundaries[1]}px`}}>
					{dividers[2]?.map((divider) => (
						<div
							key={`divider-2-${divider.pos}`}
							className="absolute top-0 h-full w-px border-[1px] border-dashed border-[blue]"
							style={{left: divider.pos}}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export default StoryMap
