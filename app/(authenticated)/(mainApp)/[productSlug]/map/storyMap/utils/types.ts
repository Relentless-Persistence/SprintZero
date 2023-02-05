import type {Id} from "~/types"

export type EpicMeta = {
	type: `epic`
	parent: undefined
	children: string[]
	position: number
	prevItem: string | undefined
	nextItem: string | undefined
}

export type FeatureMeta = {
	type: `feature`
	parent: string
	children: string[]
	position: number
	prevItem: string | undefined
	nextItem: string | undefined
}

export type StoryMeta = {
	type: `story`
	parent: string
	children: undefined
	position: number
	prevItem: string | undefined
	nextItem: string | undefined
}

export type StoryMapMeta = Record<string, EpicMeta | FeatureMeta | StoryMeta>

export type StoryMapItem = {
	type: `epic` | `feature` | `story`
	id: string
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
