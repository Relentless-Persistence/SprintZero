"use client"

import {motion, useMotionValue} from "framer-motion"
import {useAtom, useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {FC} from "react"

import {currentVersionAtom, dragStateAtom, storyMapStateAtom} from "./storyMap/atoms"
import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {
	getTargetLocation,
	moveEpic,
	moveFeature,
	moveStory,
	pointerLocation,
	storyMapScrollPosition,
} from "./storyMap/utils"
import VersionList from "./VersionList"
import {setStoryMapState} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const Dashboard: FC = () => {
	const activeProductId = useActiveProductId()
	const [dragState, setDragState] = useAtom(dragStateAtom)
	const x = useMotionValue(0)
	const y = useMotionValue(0)
	const storyMapState = useAtomValue(storyMapStateAtom)
	const currentVersion = useAtomValue(currentVersionAtom)

	useEffect(() => {
		setDragState((prev) => ({...prev, pos: [x, y]}))
	}, [setDragState, x, y])

	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			pointerLocation[0] = e.clientX
			pointerLocation[1] = e.clientY
		}
		window.addEventListener(`pointermove`, handlePointerMove)

		return () => {
			window.removeEventListener(`pointermove`, handlePointerMove)
		}
	}, [])

	const originalStoryMapState = useRef(storyMapState)
	const isUpdating = useRef(false)
	const handlePan = () => {
		if (!activeProductId || !dragState.id) return

		let newState = originalStoryMapState.current
		if (dragState.type === `epic`) {
			newState = moveEpic(
				originalStoryMapState.current,
				dragState.id,
				getTargetLocation(storyMapState),
				currentVersion.id,
			)
		} else if (dragState.type === `feature`) {
			newState = moveFeature(
				originalStoryMapState.current,
				dragState.id,
				getTargetLocation(storyMapState),
				currentVersion.id,
			)
		} else if (dragState.type === `story`) {
			newState = moveStory(originalStoryMapState.current, dragState.id, getTargetLocation(storyMapState))
		}

		if (JSON.stringify(newState) !== JSON.stringify(storyMapState)) {
			if (!isUpdating.current) {
				setStoryMapState({productId: activeProductId, storyMapState: newState})
				isUpdating.current = true
			}
		} else {
			isUpdating.current = false
		}
	}

	return (
		<motion.div
			onPan={(e, info) => {
				x.set(info.offset.x)
				y.set(info.offset.y)
				handlePan()
			}}
			onPanStart={() => {
				originalStoryMapState.current = storyMapState
			}}
			onPanEnd={() => {
				setDragState((prev) => ({...prev, id: null, type: null}))
				x.set(0)
				y.set(0)
			}}
			className="grid h-full grid-cols-[1fr_minmax(6rem,max-content)]"
		>
			<div className="flex flex-col gap-8">
				<StoryMapHeader />

				<div className="relative w-full grow">
					<motion.div
						layoutScroll
						className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2"
						onScroll={(e) => {
							storyMapScrollPosition.position = e.currentTarget.scrollLeft
						}}
					>
						<StoryMap />
					</motion.div>
				</div>
			</div>

			<VersionList />
		</motion.div>
	)
}

export default Dashboard
