import {Timestamp, updateDoc} from "firebase/firestore"
import {motion, useMotionValue, useTransform} from "framer-motion"
import {useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom"

import type {QueryDocumentSnapshot, WithFieldValue} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import StoryCard from "./StoryCard"

export type StoryContainerProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	storyId: Id
	onDrawerOpen: () => void
	isBeingDragged: boolean
	onDragStart: () => void
	onDragEnd: () => void
}

const StoryContainer: FC<StoryContainerProps> = ({
	storyMapState,
	storyId,
	onDrawerOpen,
	isBeingDragged,
	onDragStart,
	onDragEnd,
}) => {
	const ref = useRef<HTMLDivElement>(null)
	const [dragInfo, setDragInfo] = useState({
		width: 0,
		height: 0,
		offsetX: 0,
		offsetY: 0,
	})

	const x = useMotionValue(0)
	const y = useMotionValue(0)
	const xP = useTransform(x, (x) => x - dragInfo.offsetX)
	const yP = useTransform(y, (y) => y - dragInfo.offsetY)

	const pointerPos = useRef({x: 0, y: 0})
	const currentColumn = useRef<string | undefined>(undefined)
	useEffect(() => {
		const onPointerMove = (e: PointerEvent) => {
			pointerPos.current = {x: e.clientX, y: e.clientY}
			currentColumn.current = Array.from(document.querySelectorAll(`.sprint-column`)).find((column) =>
				column.contains(e.target as Node | null),
			)?.id
		}

		window.addEventListener(`pointermove`, onPointerMove)
		return () => {
			window.removeEventListener(`pointermove`, onPointerMove)
		}
	}, [])

	return (
		<>
			<motion.div
				key={storyId}
				layoutId={`sprint-story-${storyId}`}
				onPointerDown={(e) => e.preventDefault()}
				onPanStart={() => {
					const rect = ref.current!.getBoundingClientRect()
					setDragInfo({
						width: rect.width,
						height: rect.height,
						offsetX: pointerPos.current.x - rect.x,
						offsetY: pointerPos.current.y - rect.y,
					})
					onDragStart()
				}}
				onPanEnd={() => {
					updateDoc(storyMapState.ref, {
						[`items.${storyId}.sprintColumn`]: currentColumn.current,
						updatedAt: Timestamp.now(),
					} as WithFieldValue<Partial<StoryMapState>>)
						.then(() => {
							onDragEnd()
						})
						.catch(console.error)
				}}
				onPan={(e, info) => {
					x.set(info.point.x)
					y.set(info.point.y)
				}}
				className="touch-none"
				ref={ref}
			>
				<StoryCard storyMapState={storyMapState} storyId={storyId} onDrawerOpen={onDrawerOpen} />
			</motion.div>

			{isBeingDragged &&
				createPortal(
					<motion.div
						key={`${storyId}-dragging`}
						layoutId={`sprint-story-${storyId}`}
						className="pointer-events-none fixed"
						transition={{duration: 0}}
						style={{left: xP, top: yP, width: dragInfo.width, height: dragInfo.height}}
					>
						<StoryCard storyMapState={storyMapState} storyId={storyId} onDrawerOpen={onDrawerOpen} />
					</motion.div>,
					document.body,
				)}
		</>
	)
}

export default StoryContainer
