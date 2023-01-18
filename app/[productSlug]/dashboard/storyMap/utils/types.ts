import type {Id} from "~/types"

export type EpicMeta = {
	type: `epic`
	parent: undefined
	children: Id[]
	position: number
	prevItem: Id | undefined
	nextItem: Id | undefined
}

export type FeatureMeta = {
	type: `feature`
	parent: Id
	children: Id[]
	position: number
	prevItem: Id | undefined
	nextItem: Id | undefined
}

export type StoryMeta = {
	type: `story`
	parent: Id
	children: undefined
	position: number
	prevItem: Id | undefined
	nextItem: Id | undefined
}

export type StoryMapMeta = Record<Id, EpicMeta | FeatureMeta | StoryMeta>

export type StoryMapItem = {
	type: `epic` | `feature` | `story`
	id: Id
}

export type StoryMapTarget = [`before` | `after` | `beneath`, StoryMapItem] | `stay`

export type EpicBoundaries = {
	left: number
	centerWithLeft?: number
	center: number
	centerWithRight?: number
	right: number
}

export type FeatureBoundaries = {
	left: number
	centerWithLeft?: number
	center: number
	centerWithRight?: number
	right: number
}

export type StoryBoundaries = {
	top: number
	center: number
	bottom: number
}

export type CurrentVersionId = Id | `__ALL_VERSIONS__`
