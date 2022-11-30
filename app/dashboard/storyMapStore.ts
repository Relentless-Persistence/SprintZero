import create from "zustand"
import {immer} from "zustand/middleware/immer"

import type {StoryMapStore} from "./utils"

import {sortEpics, sortFeatures, sortStories, calculateDividers} from "./utils"

export const useStoryMapStore = create(
	immer<StoryMapStore>((set, get) => ({
		currentVersion: `__ALL_VERSIONS__`,
		setCurrentVersion: (version) =>
			void set((state) => {
				state.currentVersion = version
			}),
		newVersionInput: null,
		setNewVersionInput: (version) =>
			void set((state) => {
				state.newVersionInput = version
			}),

		epics: [],
		setEpics: (epics) =>
			void set((state) => {
				state.epics = sortEpics(epics).map((epic) => ({
					epic,
					element: state.epics.find((e) => e.epic.id === epic.id)?.element,
				}))
				calculateDividers(state)
			}),
		features: [],
		setFeatures: (features) =>
			void set((state) => {
				state.features = sortFeatures(
					get().epics.map((epic) => epic.epic),
					features,
				).map((feature) => ({
					feature,
					element: state.features.find((f) => f.feature.id === feature.id)?.element,
				}))
				calculateDividers(state)
			}),
		stories: [],
		setStories: (stories) =>
			void set((state) => {
				state.stories = sortStories(
					get().features.map((feature) => feature.feature),
					stories,
				).map((story) => ({
					story,
					element: state.stories.find((s) => s.story.id === story.id)?.element,
				}))
				calculateDividers(state)
			}),

		currentlyHovering: [null, null, null],
		setCurrentLayerHover: (layer, id) =>
			void set((state) => {
				state.currentlyHovering[layer] = id
			}),

		dividers: [null, null, null],
		registerElement: (layer, id, element) =>
			void set((state) => {
				switch (layer) {
					case 0: {
						// @ts-expect-error -- weird type error
						state.epics.find((epic) => epic.epic.id === id)!.element = element
						break
					}
					case 1: {
						// @ts-expect-error -- weird type error
						state.features.find((feature) => feature.feature.id === id).element = element
						break
					}
					case 2: {
						// @ts-expect-error -- weird type error
						state.stories.find((story) => story.story.id === id).element = element
						break
					}
				}
				calculateDividers(state)
			}),
		calculateDividers: () => void set(calculateDividers),
	})),
)
