import {enableMapSet} from "immer"
import create from "zustand"
import {immer} from "zustand/middleware/immer"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

enableMapSet()

type EpicStructure = {
	id: Id
	children: Array<{id: Id; children: Array<Id>}>
}

type StoryMapStore = {
	currentVersion: Id | `__ALL_VERSIONS__`
	setCurrentVersion: (version: Id | `__ALL_VERSIONS__`) => void
	epics: Map<Id, {element?: HTMLElement; epic?: Epic}>
	hasFetchedEpics: boolean
	fetchedEpics: () => void
	features: Map<Id, {element?: HTMLElement; feature?: Feature}>
	hasFetchedFeatures: boolean
	fetchedFeatures: () => void
	stories: Map<Id, {element?: HTMLElement; story?: Story}>
	hasFetchedStories: boolean
	fetchedStories: () => void
	dividers: [EpicStructure | undefined, EpicStructure | undefined, EpicStructure | undefined]
	registerElement: (layer: number, id: Id, element: HTMLElement) => void
	hasInitialized: boolean
	initialize: (epics: Epic[], features: Feature[], stories: Story[]) => void
}

export const useStoryMapStore = create(
	immer<StoryMapStore>((set) => ({
		currentVersion: `__ALL_VERSIONS__`,
		setCurrentVersion: (version) =>
			void set((state) => {
				state.currentVersion = version
			}),
		epics: new Map(),
		hasFetchedEpics: false,
		fetchedEpics: () =>
			void set((state) => {
				state.hasFetchedEpics = true
			}),
		features: new Map(),
		hasFetchedFeatures: false,
		fetchedFeatures: () =>
			void set((state) => {
				state.hasFetchedFeatures = true
			}),
		stories: new Map(),
		hasFetchedStories: false,
		fetchedStories: () =>
			void set((state) => {
				state.hasFetchedStories = true
			}),
		dividers: [undefined, undefined, undefined],
		registerElement: (layer, id, element) =>
			void set((state) => {
				switch (layer) {
					case 0: {
						if (!state.epics.has(id)) state.epics.set(id, {})
						// @ts-expect-error -- weird type error
						state.epics.get(id).element = element
						break
					}
					case 1: {
						if (!state.features.has(id)) state.features.set(id, {})
						// @ts-expect-error -- weird type error
						state.features.get(id).element = element
						break
					}
					case 2: {
						if (!state.stories.has(id)) state.stories.set(id, {})
						// @ts-expect-error -- weird type error
						state.stories.get(id).element = element
						break
					}
				}
			}),
		hasInitialized: false,
		initialize: (epics, features, stories) =>
			void set((state) => {
				if (state.hasInitialized) return
				state.hasInitialized = true
				state.epics = new Map(
					epics
						.sort((epic1, epic2) => {
							// Sort epics by prevEpic and nextEpic
							if (epic1.prevEpic === null) return -1
							if (epic2.prevEpic === null) return 1
							if (epic1.prevEpic === epic2.id) return 1
							if (epic2.prevEpic === epic1.id) return -1
							return 0
						})
						.map((epic) => [epic.id, {epic}]),
				)
				state.features = new Map(features.map((feature) => [feature.id, {feature}]))
				state.stories = new Map(stories.map((story) => [story.id, {story}]))
			}),
	})),
)

export const useFinishedFetching = () =>
	useStoryMapStore((state) => state.hasFetchedEpics && state.hasFetchedFeatures && state.hasFetchedStories)
