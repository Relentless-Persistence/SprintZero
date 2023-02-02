import {atom} from "jotai"

import type {MotionValue} from "framer-motion"

export const dragPosAtom = atom<[MotionValue<number> | undefined, MotionValue<number> | undefined]>([
	undefined,
	undefined,
])

export type DragState = {
	offset: [number, number]
}

export const dragStateAtom = atom<DragState | undefined>(undefined)
