import type {MotionValue} from "framer-motion"
import type {Id} from "~/types"

export type DragInfo = {
	mousePos: [MotionValue<number>, MotionValue<number>]
	itemBeingDragged: Id | undefined
	offset: [number, number]
}
