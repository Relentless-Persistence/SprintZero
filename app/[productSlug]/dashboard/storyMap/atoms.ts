import {atom, useAtomValue} from "jotai"

import type {MotionValue} from "framer-motion"
import type {Id} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/Products"

export const currentVersionAtom = atom<{id: Id | `__ALL_VERSIONS__`; name: string}>({
	id: `__ALL_VERSIONS__`,
	name: `All`,
})
export const newVersionInputAtom = atom<string | undefined>(undefined)

export const storyMapStateAtom = atom<StoryMapState>({epics: []})
export const useGetEpic = (epicId: Id): Epic => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	return storyMapState.epics.find((epic) => epic.id === epicId)!
}
export const useGetFeature = (epicId: Id, featureId: Id): Feature => {
	const epic = useGetEpic(epicId)
	return epic.features.find((feature) => feature.id === featureId)!
}
export const useGetStory = (epicId: Id, featureId: Id, storyId: Id): Story => {
	const feature = useGetFeature(epicId, featureId)
	return feature.stories.find((story) => story.id === storyId)!
}

export const dragStateAtom = atom<{
	id: Id | undefined
	type: `epic` | `feature` | `story` | undefined
	pos: [MotionValue<number> | undefined, MotionValue<number> | undefined]
	yOffset: number | undefined
}>({
	id: undefined,
	type: undefined,
	pos: [undefined, undefined],
	yOffset: undefined,
})
