import type {Id, WithDocumentData} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

export type EpicWithId = Epic & {id: Id}

export const getEpics = (storyMapState: WithDocumentData<StoryMapState>): EpicWithId[] => {
	const epics = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `epic`)
		.map(([id, item]) => ({id, ...item})) as Array<Epic & {id: Id}>
	return epics
}

export const sortEpics = <T extends Epic>(epics: T[]): T[] =>
	epics.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.userValue - b.userValue)

export type FeatureWithId = Feature & {id: Id}

export const getFeatures = (storyMapState: WithDocumentData<StoryMapState>): FeatureWithId[] => {
	const features = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `feature`)
		.map(([id, item]) => ({id, ...item})) as Array<Feature & {id: Id}>
	return features
}

// Assumes all features are siblings
export const sortFeatures = <T extends Feature>(features: T[]): T[] =>
	features.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.userValue - b.userValue)

export type StoryWithId = Story & {id: Id}

export const getStories = (storyMapState: WithDocumentData<StoryMapState>): StoryWithId[] => {
	const stories = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `story`)
		.map(([id, item]) => ({id, ...item})) as Array<Story & {id: Id}>
	return stories
}

// Assumes all stories are siblings
export const sortStories = (stories: StoryWithId[], allVersions: Array<WithDocumentData<Version>>): StoryWithId[] =>
	stories
		.sort((a, b) => a.name.localeCompare(b.name))
		.sort((a, b) => {
			const aVersion = allVersions.find((version) => version.id === a.versionId)
			const bVersion = allVersions.find((version) => version.id === b.versionId)
			return aVersion && bVersion ? aVersion.name.localeCompare(bVersion.name) : 0
		})
