import {sortBy} from "lodash"

import type {Id, WithDocumentData} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"

export type EpicWithId = Epic & {id: Id}

export const getEpics = (storyMapState: WithDocumentData<StoryMapState>): EpicWithId[] => {
	const epics = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `epic`)
		.map(([id, item]) => ({id, ...item})) as Array<Epic & {id: Id}>
	return epics
}

export const sortEpics = (epics: EpicWithId[]): EpicWithId[] => sortBy(epics, [(epic: EpicWithId) => epic.userValue])

export type FeatureWithId = Feature & {id: Id}

export const getFeatures = (storyMapState: WithDocumentData<StoryMapState>): FeatureWithId[] => {
	const features = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `feature`)
		.map(([id, item]) => ({id, ...item})) as Array<Feature & {id: Id}>
	return features
}

export const sortFeatures = (storyMapState: WithDocumentData<StoryMapState>, featureIds: string[]): string[] =>
	sortBy(
		featureIds.map((id) => getFeatures(storyMapState).find((feature) => feature.id === id)!),
		[(feature) => feature.userValue],
	).map((feature) => feature.id)

export type StoryWithId = Story & {id: Id}

export const getStories = (storyMapState: WithDocumentData<StoryMapState>): StoryWithId[] => {
	const stories = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `story`)
		.map(([id, item]) => ({id, ...item})) as Array<Story & {id: Id}>
	return stories
}
