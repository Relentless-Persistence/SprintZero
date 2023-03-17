import {ReadOutlined} from "@ant-design/icons"
import {Timestamp, doc, updateDoc} from "firebase/firestore"
import {motion, useMotionTemplate, useMotionValue} from "framer-motion"
import {clamp, debounce} from "lodash"
import {useEffect, useRef} from "react"

import type {DocumentReference, WithFieldValue} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import {matrixRect} from "./globals"
import {useAppContext} from "../../../AppContext"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"
import {getEpics} from "~/utils/storyMap"

export type EpicProps = {
	storyMapItems: StoryMapItem[]
	epicId: string
}

const Epic: FC<EpicProps> = ({storyMapItems, epicId}) => {
	const {product} = useAppContext()
	const epics = getEpics(storyMapItems)
	const epic = epics.find((e) => e.id === epicId)!

	const x = useMotionValue(epic.effort)
	const y = useMotionValue(epic.userValue)

	useEffect(() => {
		x.set(epics.find(({id}) => id === epic.id)!.effort)
		y.set(epics.find(({id}) => id === epic.id)!.userValue)
	}, [epic.id, epics, x, y])

	const ref = useRef<HTMLDivElement | null>(null)
	const pointerOffset = useRef<[number, number]>([0, 0])
	const moveEpic = async (x: number, y: number) => {
		await debouncedUpdateStoryMapItem(doc(product.ref, `StoryMapItems`, epic.id).withConverter(StoryMapItemConverter), {
			effort: x,
			userValue: y,
		})
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
			className="absolute flex min-w-[4rem] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none items-center gap-2 rounded-md border border-current bg-bgContainer px-2 py-1 text-[#4f2dc8] dark:text-[#6b44f8]"
			style={{top: useMotionTemplate`calc(${y}% * 100)`, left: useMotionTemplate`calc(${x}% * 100)`}}
			ref={ref}
		>
			<ReadOutlined />
			<p className="w-max font-medium">{epic.name}</p>
		</motion.div>
	)
}

export default Epic

const debouncedUpdateStoryMapItem = debounce(
	async (storyMapItemRef: DocumentReference<StoryMapItem>, data: WithFieldValue<Partial<StoryMapItem>>) => {
		await updateDoc(storyMapItemRef, {
			...data,
			updatedAt: Timestamp.now(),
		})
	},
	100,
)
