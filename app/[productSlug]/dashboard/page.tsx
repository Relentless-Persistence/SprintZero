"use client"

import {motion, useMotionTemplate, useMotionValue, useTransform} from "framer-motion"
import {useAtom, useAtomValue} from "jotai"
import {useEffect, useRef} from "react"

import type {StoryMapLocation} from "./storyMap/utils/types"
import type {FC} from "react"
import type {StoryMapState} from "~/types/db/Products"

import {currentVersionAtom, dragStateAtom, storyMapStateAtom} from "./storyMap/atoms"
import Epic from "./storyMap/epic/Epic"
import Feature from "./storyMap/feature/Feature"
import Story from "./storyMap/story/Story"
import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {pointerLocation, storyMapScrollPosition} from "./storyMap/utils/globals"
import {moveEpic, moveFeature, moveStory} from "./storyMap/utils/moving"
import {getHoveringLocation, getTargetLocation} from "./storyMap/utils/targeting"
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
	const startLocation = useRef<StoryMapLocation | undefined>(undefined)
	const oldTarget = useRef<StoryMapLocation | undefined>(undefined)
	const expectedStoryMapState = useRef<StoryMapState | undefined>(undefined)
	const handlePan = () => {
		// If there is no item being dragged, return
		if (!activeProductId || !dragState.id || !originalStoryMapState.current || !startLocation.current) return

		if (expectedStoryMapState.current) {
			// If storyMapState hasn't changed yet, return
			if (JSON.stringify(expectedStoryMapState.current) !== JSON.stringify(storyMapState)) return
			// If it has, reset some refs and continue
			expectedStoryMapState.current = undefined
			oldTarget.current = undefined
			startLocation.current = getHoveringLocation()
		}

		// If target item hasn't changed since last drag, return
		const newTarget = getTargetLocation(storyMapState, startLocation.current)
		if (!oldTarget.current || JSON.stringify(newTarget) === JSON.stringify(oldTarget.current)) {
			oldTarget.current = newTarget
			return
		}

		// At this point, we're sure the target has changed
		let newState: StoryMapState
		if (dragState.type === `epic`) {
			newState = moveEpic(storyMapState, dragState.id, newTarget, currentVersion.id)
		} else if (dragState.type === `feature`) {
			newState = moveFeature(storyMapState, dragState.id, newTarget, currentVersion.id)
		} else {
			newState = moveStory(storyMapState, dragState.id, newTarget)
		}
		expectedStoryMapState.current = newState
		setStoryMapState({productId: activeProductId, storyMapState: newState})
	}

	return (
		<motion.div
			onPan={(e, info) => {
				x.set(info.point.x)
				y.set(info.point.y)
				handlePan()
			}}
			onPanStart={() => {
				originalStoryMapState.current = storyMapState
				startLocation.current = getHoveringLocation()
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
							storyMapScrollPosition.current = e.currentTarget.scrollLeft
						}}
					>
						<StoryMap />
					</motion.div>
				</div>
			</div>

			<VersionList />

			<motion.div
				id="drag-host"
				className="fixed top-0 left-0 z-20"
				style={{x: useMotionTemplate`calc(${x}px - 50%)`, y: useTransform(y, (y) => y - (dragState.yOffset ?? 0))}}
			>
				{dragState.id &&
					activeProductId &&
					(() => {
						for (const epic of storyMapState.epics) {
							if (epic.id === dragState.id) return <Epic productId={activeProductId} epic={epic} inert />

							for (const feature of epic.features) {
								if (feature.id === dragState.id)
									return <Feature productId={activeProductId} epicId={epic.id} feature={feature} inert />

								for (const story of feature.stories) {
									if (story.id === dragState.id)
										return (
											<Story productId={activeProductId} epicId={epic.id} featureId={feature.id} story={story} inert />
										)
								}
							}
						}
					})()}
			</motion.div>
		</motion.div>
	)
}

export default Dashboard
