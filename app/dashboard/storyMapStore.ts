import {enableMapSet} from "immer"
import create from "zustand"
import {immer} from "zustand/middleware/immer"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

import {avg} from "./utils"

enableMapSet()

type Divider = {
	pos: number
	border: boolean
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

	currentlyHovering: [Id | null, Id | null, Id | null]
	setCurrentLayerHover: (layer: number, id: Id | null) => void

	dividers: [Divider[] | null, Divider[] | null, Divider[] | null]
	registerElement: (layer: number, id: Id, element: HTMLElement) => void
	allElementsRegistered: boolean
	calculateDividers: () => void
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

				if (
					Array.from(state.epics.values()).every((epic) => epic.element) &&
					Array.from(state.features.values()).every((feature) => feature.element) &&
					Array.from(state.stories.values()).every((story) => story.element)
				)
					state.allElementsRegistered = true
			}),
		allElementsRegistered: false,
		calculateDividers: () =>
			void set((state) => {
				const epics = Array.from(state.epics.values())
				const features = Array.from(state.features.values())
				const stories = Array.from(state.stories.values())

				if (
					epics.every((epic) => epic.element) &&
					features.every((feature) => feature.element) &&
					stories.every((story) => story.element)
				) {
					let epicPositions: Divider[] = []
					epics.forEach((epic, i) => {
						const epicPos = epic.element!.offsetLeft + epic.element!.offsetWidth / 2
						if (i === 0) {
							epicPositions.push({pos: epicPos, border: false})
						} else {
							epicPositions.push({pos: avg(epicPositions.at(-1)!.pos, epicPos), border: false})
							epicPositions.push({pos: epicPos, border: false})
						}
					})

					let featurePositions: Divider[] = []
					features.forEach((feature, i) => {
						const featurePos = feature.element!.offsetLeft + feature.element!.offsetWidth / 2
						if (i === 0) {
							featurePositions.push({pos: featurePos, border: false})
						} else {
							featurePositions.push({
								pos: avg(featurePositions.at(-1)!.pos, featurePos),
								border: feature.feature.prevFeature === null,
							})
							featurePositions.push({pos: featurePos, border: false})
						}
					})

					let storyPositions: Divider[] = []
					stories.forEach((story, i) => {
						const storyPos = story.element!.offsetLeft + story.element!.offsetWidth / 2
						if (i === 0) {
							storyPositions.push({pos: storyPos, border: false})
						} else {
							storyPositions.push({
								pos: avg(storyPositions.at(-1)!.pos, storyPos),
								border: story.story.prevStory === null,
							})
							storyPositions.push({pos: storyPos, border: false})
						}
					})

					state.dividers = [epicPositions, featurePositions, storyPositions]
				}
			}),
	})),
)
