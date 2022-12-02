import create from "zustand"

import type {FeatureDivider, StoryDivider} from "./utils"
import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

import {sortEpics, sortFeatures, sortStories, calculateDividers} from "./utils"

type StoryMapStore = {
	currentVersion: Id | `__ALL_VERSIONS__`
	setCurrentVersion: (version: Id | `__ALL_VERSIONS__`) => void
	newVersionInput: string | null
	setNewVersionInput: (version: string | null) => void

	epics: Epic[]
	epicElements: Record<Id, HTMLElement | null>
	setEpics: (epics: Epic[]) => void
	features: Feature[]
	featureElements: Record<Id, HTMLElement | null>
	setFeatures: (feature: Feature[]) => void
	stories: Story[]
	storyElements: Record<Id, HTMLElement | null>
	setStories: (story: Story[]) => void

	dividers: [number[] | null, FeatureDivider[] | null, Array<StoryDivider> | null]
	registerElement: (layer: number, id: Id, element: HTMLElement) => void
	calculateDividers: () => void
}

export const useStoryMapStore = create<StoryMapStore>((set, get) => ({
	currentVersion: `__ALL_VERSIONS__`,
	setCurrentVersion: (version) => void set(() => ({currentVersion: version})),
	newVersionInput: null,
	setNewVersionInput: (input) => void set(() => ({newVersionInput: input})),

	epics: [],
	epicElements: {},
	setEpics: (epics) => void set(() => ({epics: sortEpics(epics)})),
	features: [],
	featureElements: {},
	setFeatures: (features) => void set(() => ({features: sortFeatures(get().epics, features)})),
	stories: [],
	storyElements: {},
	setStories: (stories) => void set(() => ({stories: sortStories(get().features, stories)})),

	dividers: [null, null, null],
	registerElement: (layer, id, element) =>
		void set((state) => {
			switch (layer) {
				case 0: {
					const epicElements = {...state.epicElements}
					epicElements[id] = element
					return {epicElements}
				}
				case 1: {
					const featureElements = {...state.featureElements}
					featureElements[id] = element
					return {featureElements}
				}
				case 2: {
					const storyElements = {...state.storyElements}
					storyElements[id] = element
					return {storyElements}
				}
				default: {
					throw new Error(`Invalid layer: ${layer}`)
				}
			}
		}),
	calculateDividers: () =>
		void set((state) => ({
			dividers:
				calculateDividers(
					state.epics,
					state.epicElements,
					state.features,
					state.featureElements,
					state.stories,
					state.storyElements,
					state.currentVersion,
				) ?? state.dividers,
		})),
}))
