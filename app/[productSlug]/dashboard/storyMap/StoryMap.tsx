"use client"

import {ReadOutlined} from "@ant-design/icons"
import {motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform} from "framer-motion"
import {useAtom, useAtomValue, useSetAtom} from "jotai"
import {useEffect, useRef} from "react"

import type {StoryMapItem, StoryMapTarget} from "./utils/types"
import type {FC} from "react"
import type {StoryMapState} from "~/types/db/Products"

import {currentVersionAtom, dragPosAtom, dragStateAtom, storyMapStateAtom} from "./atoms"
import Epic from "./epic/Epic"
import Feature from "./feature/Feature"
import Story from "./story/Story"
import {calculateBoundaries, meta, useSubscribeToData} from "./utils"
import {dragState, elementRegistry, pointerLocation, storyMapTop} from "./utils/globals"
import {moveItem} from "./utils/moving"
import {getHoveringItems, getTargetItem as getTargetLocation} from "./utils/targeting"
import {addEpic, setStoryMapState} from "~/utils/api/mutations"
import {useActiveProductId} from "~/utils/useActiveProductId"

const StoryMap: FC = () => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	const activeProductId = useActiveProductId()
	const currentVersion = useAtomValue(currentVersionAtom)
	const setDragPos = useSetAtom(dragPosAtom)
	const [reactDragState, setReactDragState] = useAtom(dragStateAtom)
	const x = useMotionValue(0)
	const y = useMotionValue(0)

	useSubscribeToData()

	useEffect(() => {
		setDragPos([x, y])
	}, [setDragPos, x, y])

	useEffect(() => {
		if(typeof window !== `undefined`) {
			const handlePointerMove = (e: PointerEvent) => {
				pointerLocation.current = [e.clientX, e.clientY]
				x.set(e.clientX)
				y.set(e.clientY)
			}
			window.addEventListener(`pointermove`, handlePointerMove)

			return () => {
				window.removeEventListener(`pointermove`, handlePointerMove)
			}
		}
	}, [x, y])

	useAnimationFrame(() => {
		calculateBoundaries(storyMapState, currentVersion.id)
	})

	const originalStoryMapState = useRef(storyMapState)
	const startTarget = useRef<StoryMapTarget | undefined>(undefined)
	const startItem = useRef<StoryMapItem | undefined>(undefined)
	const expectedStoryMapState = useRef<StoryMapState | undefined>(undefined)

	const handlePanStart = () => {
		originalStoryMapState.current = storyMapState
		const hoveringItems = getHoveringItems()
		if (hoveringItems.story) {
			const storyBoundingBox = elementRegistry[hoveringItems.story]?.content.getBoundingClientRect()

			const parent = meta<`story`>(hoveringItems.story).parent
			const parentBoundingBox = elementRegistry[parent]?.container.getBoundingClientRect()
			if (!parentBoundingBox || !storyBoundingBox) return

			if (
				pointerLocation.current[0] < storyBoundingBox.left - 16 ||
				pointerLocation.current[0] > storyBoundingBox.right + 16 ||
				pointerLocation.current[1] < storyBoundingBox.top - 16 ||
				pointerLocation.current[1] > storyBoundingBox.bottom + 16
			)
				return

			startItem.current = {
				type: `story`,
				id: hoveringItems.story,
			}
			dragState.current = {
				type: `story`,
				id: hoveringItems.story,
				offset: [
					pointerLocation.current[0] - parentBoundingBox.left,
					pointerLocation.current[1] - storyBoundingBox.top,
				],
				xOffsetFromCenter: pointerLocation.current[0] - storyBoundingBox.left - storyBoundingBox.width / 2,
			}
			setReactDragState({offset: dragState.current.offset})
		} else if (hoveringItems.feature) {
			const featureBoundingBox = elementRegistry[hoveringItems.feature]?.content.getBoundingClientRect()
			if (!featureBoundingBox) return

			if (
				pointerLocation.current[0] < featureBoundingBox.left - 16 ||
				pointerLocation.current[0] > featureBoundingBox.right + 16 ||
				pointerLocation.current[1] < featureBoundingBox.top - 16 ||
				pointerLocation.current[1] > featureBoundingBox.bottom + 16
			)
				return

			startItem.current = {
				type: `feature`,
				id: hoveringItems.feature,
			}
			dragState.current = {
				type: `feature`,
				id: hoveringItems.feature,
				offset: [
					pointerLocation.current[0] - featureBoundingBox.left,
					pointerLocation.current[1] - featureBoundingBox.top,
				],
				xOffsetFromCenter: pointerLocation.current[0] - featureBoundingBox.left - featureBoundingBox.width / 2,
			}
			setReactDragState({offset: dragState.current.offset})
		} else if (hoveringItems.epic) {
			const epicBoundingBox = elementRegistry[hoveringItems.epic]?.content.getBoundingClientRect()
			if (!epicBoundingBox) return

			if (
				pointerLocation.current[0] < epicBoundingBox.left - 16 ||
				pointerLocation.current[0] > epicBoundingBox.right + 16 ||
				pointerLocation.current[1] < epicBoundingBox.top - 16 ||
				pointerLocation.current[1] > epicBoundingBox.bottom + 16
			)
				return

			startItem.current = {
				type: `epic`,
				id: hoveringItems.epic,
			}
			dragState.current = {
				type: `epic`,
				id: hoveringItems.epic,
				offset: [pointerLocation.current[0] - epicBoundingBox.left, pointerLocation.current[1] - storyMapTop],
				xOffsetFromCenter: pointerLocation.current[0] - epicBoundingBox.left - epicBoundingBox.width / 2,
			}
			setReactDragState({offset: dragState.current.offset})
		}
	}

	const handlePan = () => {
		if (!startItem.current || !activeProductId || !dragState.current) return

		if (
			expectedStoryMapState.current &&
			JSON.stringify(storyMapState) !== JSON.stringify(expectedStoryMapState.current)
		)
			return
		expectedStoryMapState.current = undefined

		if (!startTarget.current) {
			startTarget.current = getTargetLocation()
			return
		}

		const target = getTargetLocation()

		if (JSON.stringify(target) !== JSON.stringify(startTarget.current)) {
			const newStoryMapState = moveItem(
				storyMapState,
				originalStoryMapState.current,
				startItem.current,
				target,
				currentVersion.id === `__ALL_VERSIONS__` ? undefined : currentVersion.id,
			)

			if (JSON.stringify(newStoryMapState) === JSON.stringify(storyMapState)) return
			setStoryMapState({storyMapState: newStoryMapState})
			expectedStoryMapState.current = newStoryMapState

			// Update startItem type
			if (newStoryMapState.epics.find((epic) => epic.id === startItem.current!.id)) {
				startItem.current.type = dragState.current.type = `epic`
			} else if (newStoryMapState.features.find((feature) => feature.id === startItem.current!.id)) {
				startItem.current.type = dragState.current.type = `feature`
			} else if (newStoryMapState.stories.find((story) => story.id === startItem.current!.id))
				startItem.current.type = dragState.current.type = `story`
			startTarget.current = undefined
		}
	}

	const dragHostStyle = {
		x: useMotionTemplate`${useTransform(x, (x) => x - (reactDragState?.offset[0] ?? 0))}px`,
		y: useTransform(y, (y) => y - (reactDragState?.offset[1] ?? 0)),
	}

	return (
		<>
			<motion.div
				onPan={() => void handlePan()}
				onPanStart={handlePanStart}
				onPanEnd={() => {
					startTarget.current = undefined
					startItem.current = undefined
					dragState.current = undefined
					setReactDragState(undefined)
				}}
				className="relative z-10 flex w-max items-start gap-8"
			>
				{storyMapState.epics.map((epic) => (
					<Epic key={epic.id} epic={epic} />
				))}

				<button
					type="button"
					onClick={() => void addEpic({storyMapState, data: {}})}
					className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#4f2dc8] transition-colors hover:bg-[#faf8ff]"
				>
					<ReadOutlined />
					<span>Add epic</span>
				</button>
			</motion.div>

			{dragState.current && (
				<motion.div id="drag-host" className="fixed top-0 left-0 z-20" style={dragHostStyle}>
					{activeProductId &&
						(() => {
							for (const epic of storyMapState.epics) {
								if (epic.id === dragState.current.id) return <Epic epic={epic} inert />
							}

							for (const feature of storyMapState.features) {
								if (feature.id === dragState.current.id) return <Feature feature={feature} inert />
							}

							for (const story of storyMapState.stories) {
								if (story.id === dragState.current.id) return <Story story={story} inert />
							}
						})()}
				</motion.div>
			)}
		</>
	)
}

export default StoryMap
