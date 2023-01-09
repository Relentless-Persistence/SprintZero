"use client"

import {ReadOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"
import {useInterval} from "react-use"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import {epicsAtom, storyMapStateAtom} from "./atoms"
import Epic from "./epic/Epic"
import {calculateDividers, useSubscribeToData} from "./utils"
import {addEpic} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const StoryMap: FC = () => {
	const activeProductId = useActiveProductId()
	const epics = useAtomValue(epicsAtom)
	const storyMapState = useAtomValue(storyMapStateAtom)

	useSubscribeToData()

	useInterval(() => calculateDividers(storyMapState), 100)

	return (
		<div className="relative z-10 flex w-max items-start">
			{storyMapState
				.map(({epic}) => epics.find((e) => e.id === epic))
				.filter((epic): epic is EpicType => epic !== undefined)
				.map((epic) => (
					<Epic key={epic.id} epic={epic} />
				))}

			<button
				type="button"
				onClick={() => void addEpic({productId: activeProductId!, name: `Epic`, description: ``})}
				className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#4f2dc8] transition-colors hover:bg-[#faf8ff]"
			>
				<ReadOutlined />
				<span>Add epic</span>
			</button>
		</div>
	)
}

export default StoryMap
