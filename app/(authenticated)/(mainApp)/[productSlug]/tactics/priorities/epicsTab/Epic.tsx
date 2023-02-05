"use client"

import {ReadOutlined} from "@ant-design/icons"
import {motion, useMotionTemplate, useMotionValue} from "framer-motion"
import produce from "immer"
import {clamp, debounce} from "lodash"
import {useEffect, useRef} from "react"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Epic as EpicType, StoryMapState} from "~/types/db/StoryMapStates"

import {matrixRect} from "../globals"
import {sortEpics} from "~/app/(authenticated)/(mainApp)/[productSlug]/map/storyMap/utils"
import {setStoryMapState} from "~/utils/mutations"

const debouncedSetStoryMapState = debounce(setStoryMapState, 100)

export type EpicProps = {
	storyMapState: WithDocumentData<StoryMapState>
	epic: EpicType
}

const Epic: FC<EpicProps> = ({epic, storyMapState}) => {
	const x = useMotionValue(epic.effort)
	const y = useMotionValue(epic.userValue)

	useEffect(() => {
		x.set(storyMapState.epics.find((e) => e.id === epic.id)!.effort)
		y.set(storyMapState.epics.find((e) => e.id === epic.id)!.userValue)
	}, [epic.id, storyMapState.epics, x, y])

	const ref = useRef<HTMLDivElement | null>(null)
	const pointerOffset = useRef<[number, number]>([0, 0])
	const moveEpic = (x: number, y: number) => {
		const newStoryMapState = produce(storyMapState, (state) => {
			const newEpic = state.epics.find((e) => e.id === epic.id)!
			newEpic.effort = x
			newEpic.userValue = y
			state.epics = sortEpics(state.epics)
		})
		debouncedSetStoryMapState({id: newStoryMapState.id, data: newStoryMapState})
	}

	return (
		<motion.div
			key={epic.id}
			onPointerDown={(e) => {
				const boundingBox = ref.current!.getBoundingClientRect()
				const center = [boundingBox.left + boundingBox.width / 2, boundingBox.top + boundingBox.height / 2] as const
				pointerOffset.current = [e.clientX - center[0], e.clientY - center[1]]
			}}
			onPan={(e, info) => {
				let newX = (info.point.x - pointerOffset.current[0] - matrixRect.current.left) / matrixRect.current.width
				newX = clamp(newX, 0, 1)
				let newY = (info.point.y - pointerOffset.current[1] - matrixRect.current.top) / matrixRect.current.height
				newY = clamp(newY, 0, 1)

				x.set(newX)
				y.set(newY)
				moveEpic(newX, newY)
			}}
			className="absolute flex min-w-[4rem] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8]"
			style={{top: useMotionTemplate`calc(${y}% * 100)`, left: useMotionTemplate`calc(${x}% * 100)`}}
			ref={ref}
		>
			<ReadOutlined />
			<p>{epic.name}</p>
		</motion.div>
	)
}

export default Epic
