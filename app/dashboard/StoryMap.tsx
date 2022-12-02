"use client"

import {ReadOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import {useAnimationFrame} from "framer-motion"

import type {FC} from "react"

import Epic from "./Epic"
import {useStoryMapStore} from "./storyMapStore"
import {useSubscribeToData} from "./utils"
import useMainStore from "~/stores/mainStore"
import {addEpic} from "~/utils/fetch"

const StoryMap: FC = () => {
	const activeProduct = useMainStore((state) => state.activeProduct)
	const elements = useStoryMapStore((state) => state.elements)
	const calculateDividers = useStoryMapStore((state) => state.calculateDividers)
	const pendingDomChanges = useStoryMapStore((state) => state.pendingDomChanges)

	useAnimationFrame(() => {
		pendingDomChanges.forEach(({type, id}) => {
			const element = elements[id]
			if (type === `delete`) {
				if (!element?.isConnected) calculateDividers(id)
			} else {
				if (element) calculateDividers(id)
			}
		})
	})

	useSubscribeToData()

	const epics = useStoryMapStore((state) => state.epics)

	const addEpicMutation = useMutation({
		mutationKey: [`add-epic`, activeProduct],
		mutationFn: activeProduct ? addEpic(activeProduct) : async () => {},
	})

	return (
		<div className="relative z-10 flex w-max gap-8">
			{epics.map((epic) => (
				<Epic key={epic.id} epic={epic} />
			))}
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
	)
}

export default StoryMap
