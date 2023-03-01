"use client"

import {CopyOutlined} from "@ant-design/icons"
import {Timestamp, updateDoc} from "firebase/firestore"
import {motion, useMotionTemplate, useMotionValue} from "framer-motion"
import produce from "immer"
import {clamp, debounce} from "lodash"
import {useEffect, useRef} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import {matrixRect} from "./globals"
import {getFeatures} from "~/utils/storyMap"

export type FeatureProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	featureId: Id
}

const Feature: FC<FeatureProps> = ({storyMapState, featureId}) => {
	const features = getFeatures(storyMapState.data().items)
	const feature = features.find(({id}) => id === featureId)!

	const x = useMotionValue(feature.effort)
	const y = useMotionValue(feature.userValue)

	useEffect(() => {
		x.set(features.find(({id}) => id === feature.id)!.effort)
		y.set(features.find(({id}) => id === feature.id)!.userValue)
	}, [feature.id, features, x, y])

	const ref = useRef<HTMLDivElement | null>(null)
	const pointerOffset = useRef<[number, number]>([0, 0])
	const moveFeature = async (x: number, y: number) => {
		const items = produce(storyMapState.data().items, (draft) => {
			const newFeature = Object.entries(draft).find(([id]) => id === feature.id)![1]!
			newFeature.effort = x
			newFeature.userValue = y
		})
		await debouncedSetStoryMapStateItems(storyMapState, items)
	}

	return (
		<motion.div
			key={feature.id}
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
				moveFeature(newX, newY).catch(console.error)
			}}
			className="absolute flex min-w-[4rem] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none items-center gap-2 rounded-md border border-current bg-bgContainer px-2 py-1 text-[#006378] dark:text-[#00a2c4]"
			style={{top: useMotionTemplate`calc(${y}% * 100)`, left: useMotionTemplate`calc(${x}% * 100)`}}
			ref={ref}
		>
			<CopyOutlined />
			<p>{feature.name}</p>
		</motion.div>
	)
}

export default Feature

const debouncedSetStoryMapStateItems = debounce(
	async (storyMapState: QueryDocumentSnapshot<StoryMapState>, data: StoryMapState[`items`]) => {
		await updateDoc(storyMapState.ref, {
			items: data,
			updatedAt: Timestamp.now(),
		})
	},
	100,
)
