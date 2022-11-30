import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

export const avg = (...arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

export const sortEpics = (epics: Epic[]): Epic[] =>
	epics.sort((epic1, epic2) => {
		// Sort epics by prevEpic and nextEpic
		if (epic1.prevEpic === null) return -1
		if (epic2.prevEpic === null) return 1
		if (epic1.prevEpic === epic2.id) return 1
		if (epic2.prevEpic === epic1.id) return -1
		return 0
	})

export const sortFeatures = (features: Feature[]): Feature[] =>
	features.sort((feature1, feature2) => {
		if (feature1.prevFeature === null) return -1
		if (feature2.prevFeature === null) return 1
		if (feature1.prevFeature === feature2.id) return 1
		if (feature2.prevFeature === feature1.id) return -1
		return 0
	})

export const sortStories = (stories: Story[]): Story[] =>
	stories.sort((story1, story2) => {
		if (story1.prevStory === null) return -1
		if (story2.prevStory === null) return 1
		if (story1.prevStory === story2.id) return 1
		if (story2.prevStory === story1.id) return -1
		return 0
	})
