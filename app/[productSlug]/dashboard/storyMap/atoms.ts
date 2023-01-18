import {atom} from "jotai"

import type {CurrentVersionId} from "./utils/types"
import type {MotionValue} from "framer-motion"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/Products"

export const currentVersionAtom = atom<{id: CurrentVersionId; name: string}>({
	id: `__ALL_VERSIONS__`,
	name: `All`,
})
export const newVersionInputAtom = atom<string | undefined>(undefined)

export const storyMapStateAtom = atom<StoryMapState>({productId: `` as Id, epics: [], features: [], stories: []})

export const dragPosAtom = atom<[MotionValue<number> | undefined, MotionValue<number> | undefined]>([
	undefined,
	undefined,
])

export type DragState = {
	offset: [number, number]
}

export const dragStateAtom = atom<DragState | undefined>(undefined)
