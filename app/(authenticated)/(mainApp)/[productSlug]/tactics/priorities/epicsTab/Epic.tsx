"use client"

import {ReadOutlined} from "@ant-design/icons"
import {doc, setDoc} from "firebase/firestore"
import {motion, useMotionTemplate, useMotionValue} from "framer-motion"
import produce from "immer"
import {clamp, debounce} from "lodash"
import {useEffect, useRef} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import {matrixRect} from "../globals"
import {db} from "~/utils/firebase"
import {getEpics} from "~/utils/storyMap"

const debouncedSetStoryMapState = debounce(async (id: Id, data: StoryMapState) => {
	await setDoc(doc(db, `StoryMapStates`, id), data)
}, 100)

export type EpicProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	epicId: Id
}

const Epic: FC<EpicProps> = ({storyMapState, epicId}) => {
	const epics = getEpics(storyMapState.data())
	const epic = epics.find((e) => e.id === epicId)!

	const x = useMotionValue(epic.effort)
	const y = useMotionValue(epic.userValue)

	useEffect(() => {
		x.set(epics.find((e) => e.id === epic.id)!.effort)
		y.set(epics.find((e) => e.id === epic.id)!.userValue)
	}, [epic.id, epics, x, y])

	const ref = useRef<HTMLDivElement | null>(null)
	const pointerOffset = useRef<[number, number]>([0, 0])
	const moveEpic = async (x: number, y: number) => {
		const newStoryMapState = produce(storyMapState.data(), (state) => {
			const epics = getEpics(state)
			const newEpic = epics.find((e) => e.id === epic.id)!
			newEpic.effort = x
			newEpic.userValue = y
		})
		await debouncedSetStoryMapState(storyMapState.id as Id, newStoryMapState)
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
				moveEpic(newX, newY).catch(console.error)
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
