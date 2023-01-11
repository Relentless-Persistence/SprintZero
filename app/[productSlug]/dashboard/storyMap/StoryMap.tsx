"use client"

import {ReadOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"

import type {FC} from "react"

import {storyMapStateAtom} from "./atoms"
import DebugVisualizer from "./DebugVisualizer"
import Epic from "./epic/Epic"
import {useSubscribeToData} from "./utils"
import {addEpic} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const StoryMap: FC = () => {
	const activeProductId = useActiveProductId()
	const storyMapState = useAtomValue(storyMapStateAtom)

	useSubscribeToData()

	return (
		<div className="relative z-10 flex w-max items-start gap-8">
			{activeProductId && storyMapState.map((epic) => <Epic key={epic.id} productId={activeProductId} epic={epic} />)}

			<button
				type="button"
				onClick={() => void addEpic({productId: activeProductId!, data: {name: `Epic`, description: ``}})}
				className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#4f2dc8] transition-colors hover:bg-[#faf8ff]"
			>
				<ReadOutlined />
				<span>Add epic</span>
			</button>

			<DebugVisualizer />
		</div>
	)
}

export default StoryMap
