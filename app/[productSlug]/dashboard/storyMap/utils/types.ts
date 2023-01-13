import type {Id} from "~/types"

export type StoryMapLocation = {
	epic?: number
	feature?: number
	story?: number
}

export type StoryBoundaries = {
	id: Id
	top: number
	center: number
	bottom: number
}

export type FeatureBoundaries = {
	id: Id
	left: number
	center: number
	right: number
	centerWithLeft?: number
	centerWithRight?: number
	storyBoundaries: StoryBoundaries[]
}

export type EpicBoundaries = {
	id: Id
	left: number
	center: number
	right: number
	centerWithLeft?: number
	centerWithRight?: number
	featureBoundaries: FeatureBoundaries[]
}
