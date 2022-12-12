import create from "zustand"

import type {FeatureDivider, StoryDivider, StoryMapStore} from "./types"

import {
	avg,
	epicsByCurrentVersion,
	featuresByCurrentVersion,
	sortEpics,
	sortFeatures,
	sortStories,
	storiesByCurrentVersion,
} from "./utils"

export const useStoryMapStore = create<StoryMapStore>((set, get) => ({
	currentVersion: `__ALL_VERSIONS__`,
	setCurrentVersion: (version) => void set(() => ({currentVersion: version})),
	newVersionInput: null,
	setNewVersionInput: (input) => void set(() => ({newVersionInput: input})),

	epics: [],
	setEpics: (epics) => void set(() => ({epics: sortEpics(epics)})),
	features: [],
	setFeatures: (features) => void set(() => ({features: sortFeatures(get().epics, features)})),
	stories: [],
	setStories: (stories) => void set(() => ({stories: sortStories(get().features, stories)})),

	elements: {},
	registerElement: (id, element) =>
		void set((state) => {
			const elements = {...state.elements}
			elements[id] = element
			return {elements}
		}),
	pendingDomChanges: [],
	reportPendingDomChange: (update) => void set((state) => ({pendingDomChanges: [...state.pendingDomChanges, update]})),
	dividers: [null, null, null],
	calculateDividers: (reason) =>
		void set(({epics, features, stories, elements, currentVersion, pendingDomChanges}) => {
			if (
				epicsByCurrentVersion(epics, stories, currentVersion).every((epic) => !!elements[epic.id]) &&
				featuresByCurrentVersion(features, stories, currentVersion).every((feature) => !!elements[feature.id]) &&
				storiesByCurrentVersion(stories, currentVersion).every((story) => !!elements[story.id])
			) {
				let epicDividers: number[] = []
				epics.forEach((epic, i) => {
					const element = elements[epic.id]!
					const epicPos = element!.offsetLeft + element!.offsetWidth / 2
					if (i > 0) epicDividers.push(avg(epicDividers.at(-1)!, epicPos))
					epicDividers.push(epicPos)
				})

				let featureDividers: FeatureDivider[] = []
				features.forEach((feature, i) => {
					const element = elements[feature.id]!
					const featurePos = element!.offsetLeft + element!.offsetWidth / 2
					if (i === 0) {
						featureDividers.push({pos: featurePos, border: false})
					} else {
						featureDividers.push({
							pos: avg(featureDividers.at(-1)!.pos, featurePos),
							border: feature.prev_feature === null,
						})
						featureDividers.push({pos: featurePos, border: false})
					}
				})

				let storyDividers: StoryDivider[] = features.map((feature) => {
					const element = elements[feature.id]!
					return {
						featureId: feature.id,
						featureLeft: element!.offsetLeft,
						featureRight: element!.offsetLeft + element!.offsetWidth,
						dividers: (() => {
							const featureStories = stories.filter((story) => story.feature === feature.id)
							const dividers: number[] = []
							featureStories.forEach((story, i) => {
								const element = elements[story.id]!
								const storyPos = element!.offsetTop + element!.offsetHeight / 2
								if (i > 0) dividers.push(avg(dividers.at(-1)!, storyPos))
								dividers.push(storyPos)
							})
							return dividers
						})(),
					}
				})

				return {
					dividers: [epicDividers, featureDividers, storyDividers],
					pendingDomChanges: pendingDomChanges.filter(({id}) => id !== reason),
				}
			}
			return {}
		}),
}))
