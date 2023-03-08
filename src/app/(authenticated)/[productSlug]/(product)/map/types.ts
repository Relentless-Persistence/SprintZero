import type {MotionValue} from "framer-motion"

export type DragInfo = {
	mousePos: [MotionValue<number>, MotionValue<number>]
	itemBeingDraggedId: string | undefined
	offsetToTopLeft: [number, number]
	offsetToMiddle: [number, number]
}
