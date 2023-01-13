"use client"

import {motion, useMotionValue} from "framer-motion"
import {useAtom, useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {StoryMapLocation} from "./storyMap/utils"
import type {FC} from "react"
import type {StoryMapState} from "~/types/db/Products"

import {currentVersionAtom, dragStateAtom, storyMapStateAtom} from "./storyMap/atoms"
import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {
	getFeatureLocation,
	getStoryLocation,
	getEpicLocation,
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
			pointerLocation.current = [e.clientX, e.clientY]
		}
		window.addEventListener(`pointermove`, handlePointerMove)

		return () => {
			window.removeEventListener(`pointermove`, handlePointerMove)
		}
	}, [])

	const originalStoryMapState = useRef<StoryMapState | undefined>(undefined)
	const oldTarget = useRef<StoryMapLocation | undefined>(undefined)
	const expectedStoryMapState = useRef<StoryMapState | undefined>(undefined)
	const handlePan = () => {
		// If there is no item being dragged, early return
		if (!activeProductId || !dragState.id || !originalStoryMapState.current) return

		if (expectedStoryMapState.current) {
			// If storyMapState hasn't changed yet, return
			if (JSON.stringify(expectedStoryMapState.current) !== JSON.stringify(storyMapState)) return
			// If it has, reset expectedStoryMapState and continue
			expectedStoryMapState.current = undefined
			oldTarget.current = undefined
		}

		// If target hasn't changed since last drag, return
		const newTarget = getTargetLocation(storyMapState)
		if (!oldTarget.current || JSON.stringify(newTarget) === JSON.stringify(oldTarget.current)) {
			oldTarget.current = newTarget
			return
		}

		// At this point, we're sure the target has changed
		let newState = originalStoryMapState.current
		if (dragState.type === `epic`) {
			newState = moveEpic(
				originalStoryMapState.current,
				dragState.id,
				getTargetLocation(storyMapState, getEpicLocation(storyMapState, dragState.id)),
				currentVersion.id,
			)
		} else if (dragState.type === `feature`) {
			newState = moveFeature(
				originalStoryMapState.current,
				dragState.id,
				getTargetLocation(storyMapState, getFeatureLocation(storyMapState, dragState.id)),
				currentVersion.id,
			)
		} else if (dragState.type === `story`) {
			newState = moveStory(
				originalStoryMapState.current,
				dragState.id,
				getTargetLocation(storyMapState, getStoryLocation(storyMapState, dragState.id)),
			)
		}
		expectedStoryMapState.current = newState
		setStoryMapState({productId: activeProductId, storyMapState: newState})
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
				setDragState((prev) => ({...prev, id: undefined, type: undefined}))
				x.set(0)
				y.set(0)
				oldTarget.current = undefined
				originalStoryMapState.current = undefined
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
