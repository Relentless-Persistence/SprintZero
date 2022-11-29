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
	epics: Map<Id, {element?: HTMLElement; epic: Epic}>
	setEpics: (epics: Epic[]) => void
	features: Map<Id, {element?: HTMLElement; feature: Feature}>
	setFeatures: (feature: Feature[]) => void
	stories: Map<Id, {element?: HTMLElement; story: Story}>
	setStories: (story: Story[]) => void
	dividers: [EpicStructure | undefined, EpicStructure | undefined, EpicStructure | undefined]
	registerElement: (layer: number, id: Id, element: HTMLElement) => void
}

export const useStoryMapStore = create(
	immer<StoryMapStore>((set) => ({
		currentVersion: `__ALL_VERSIONS__`,
		setCurrentVersion: (version) =>
			void set((state) => {
				state.currentVersion = version
			}),
		epics: new Map(),
		setEpics: (epics) =>
			void set((state) => {
				epics.forEach((epic) => state.epics.set(epic.id, {epic}))
			}),
		features: new Map(),
		setFeatures: (features) =>
			void set((state) => {
				features.forEach((feature) => state.features.set(feature.id, {feature}))
			}),
		stories: new Map(),
		setStories: (stories) =>
			void set((state) => {
				stories.forEach((story) => state.stories.set(story.id, {story}))
			}),
		dividers: [undefined, undefined, undefined],
		registerElement: (layer, id, element) =>
			void set((state) => {
				switch (layer) {
					case 0: {
						// @ts-expect-error -- weird type error
						state.epics.get(id).element = element
						break
					}
					case 1: {
						// @ts-expect-error -- weird type error
						state.features.get(id).element = element
						break
					}
					case 2: {
						// @ts-expect-error -- weird type error
						state.stories.get(id).element = element
						break
					}
				}
			}),
	})),
)
