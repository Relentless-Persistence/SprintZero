import type {MotionValue} from "framer-motion"
import type {Id} from "~/types"

export type DragInfo = {
	mousePos: [MotionValue<number>, MotionValue<number>]
	itemBeingDraggedId: Id | undefined
	offsetToTopLeft: [number, number]
	offsetToMiddle: [number, number]
}

export type StoryMapLocation = {
	epic: number
	feature: number
	story: number
}

export type StoryMapTargetLocation = {
	epic: number
	feature: number | undefined
	story: number | undefined
}
