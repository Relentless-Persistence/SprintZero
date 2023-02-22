import type {MotionValue} from "framer-motion"
import type {Id} from "~/types"

export type DragInfo = {
	mousePos: [MotionValue<number>, MotionValue<number>]
	itemBeingDraggedId: Id | undefined
	offsetToTopLeft: [number, number]
	offsetToMiddle: [number, number]
}
