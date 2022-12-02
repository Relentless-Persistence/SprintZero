"use client"

import {ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"

import type {FC} from "react"

import Epic from "./Epic"
import {useStoryMapStore} from "./storyMapStore"
import {useSubscribeToData} from "./utils"
import useMainStore from "~/stores/mainStore"
import {addEpic} from "~/utils/fetch"

const StoryMap: FC = () => {
	const activeProduct = useMainStore((state) => state.activeProduct)

	useSubscribeToData()

	const epics = useStoryMapStore((state) => state.epics)

	const addEpicMutation = useMutation({mutationFn: activeProduct ? addEpic(activeProduct) : async () => {}})

	return (
		<div className="flex w-max">
			<div className="flex gap-1">
				{epics.map((epic) => (
					<Epic key={epic.id} epic={epic} />
				))}
			</div>
			<div className="py-4 px-8">
				<Button
					type="dashed"
					onClick={() => void addEpicMutation.mutate({name: `Epic`, description: `description`})}
					className="flex items-center bg-white transition-colors hover:bg-[#faf8ff]"
					style={{borderColor: `#4f2dc8`, color: `#4f2dc8`, padding: `0.25rem 0.5rem`}}
				>
					<ReadOutlined />
					<span>Add epic</span>
				</Button>
			</div>
		</div>
	)
}

export default StoryMap
