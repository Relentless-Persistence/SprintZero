import {doc, onSnapshot} from "firebase9/firestore"
import produce from "immer"
import {useSetAtom} from "jotai"
import {useEffect} from "react"

import type {Id} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/Products"

import {storyMapStateAtom} from "./atoms"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {useActiveProductId} from "~/utils/useActiveProductId"

const storyMapTop = 216

type TargetLocation = {
	epic: number | null
	feature: number | null
	story: number | null
}

declare global {
	interface Window {
		__storyMapScrollPosition: {position: number}
		__elementRegistry: {
			epics: Record<Id, {content: HTMLElement | null; container: HTMLElement | null}>
			features: Record<Id, {content: HTMLElement | null; container: HTMLElement | null}>
			stories: Record<Id, HTMLElement | null>
		}
		__epicBoundaries: Record<Id, {left: number; center: number; right: number}>
		__featureBoundaries: Record<Id, {left: number; center: number; right: number}>
		__storyBoundaries: Record<Id, {top: number; center: number; bottom: number}>
		__pointerLocation: [number, number]
		__pointerOffset: {current: [number, number] | null}
	}
}

if (typeof window !== `undefined`) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__storyMapScrollPosition = window.__storyMapScrollPosition ?? {position: 0}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__elementRegistry = window.__elementRegistry ?? {
		epics: {},
		features: {},
		stories: {},
	}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__epicBoundaries = window.__epicBoundaries ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__featureBoundaries = window.__featureBoundaries ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__storyBoundaries = window.__storyBoundaries ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__pointerLocation = window.__pointerLocation ?? [0, 0]
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__pointerOffset = window.__pointerOffset ?? {current: null}
}

export let storyMapScrollPosition = window.__storyMapScrollPosition
export let elementRegistry = window.__elementRegistry
export const layerBoundaries: [number, number] = [62, 164]
export let epicBoundaries = window.__epicBoundaries
export let featureBoundaries = window.__featureBoundaries
export let storyBoundaries = window.__storyBoundaries
export let pointerLocation = window.__pointerLocation
export let pointerOffset = window.__pointerOffset

const getElementTranslation = (element: HTMLElement): [number, number] => {
	const style = window.getComputedStyle(element)
	const matrix = new DOMMatrix(style.transform)
	return [matrix.m41, matrix.m42]
}

export const calculateBoundaries = (storyMapState: StoryMapState): void => {
	Object.entries(elementRegistry.epics).forEach(([id, element]) => {
		// Initialize the boundaries if they don't exist
		if (!epicBoundaries[id as Id]) epicBoundaries[id as Id] = {left: 0, center: 0, right: 0}

		const boundaries = epicBoundaries[id as Id]!

		if (element.container && element.content) {
			const translation = getElementTranslation(element.container)
			const isFirstEpic = id === storyMapState[0]!.id
			const isLastEpic = id === storyMapState[storyMapState.length - 1]!.id

			const containerBoundingRect = element.container.getBoundingClientRect()
			boundaries.left = isFirstEpic ? 0 : containerBoundingRect.left + storyMapScrollPosition.position - translation[0]
			boundaries.right = isLastEpic
				? Infinity
				: containerBoundingRect.right + storyMapScrollPosition.position - translation[0]

			const contentBoundingRect = element.content.getBoundingClientRect()
			boundaries.center =
				avg(contentBoundingRect.left, contentBoundingRect.right) - translation[0] + storyMapScrollPosition.position
		}
	})

	Object.entries(elementRegistry.features).forEach(([id, element]) => {
		if (!featureBoundaries[id as Id]) featureBoundaries[id as Id] = {left: 0, center: 0, right: 0}
		const boundaries = featureBoundaries[id as Id]!

		if (element.container && element.content) {
			const translation = getElementTranslation(element.container)
			const epicIndex = storyMapState.findIndex((epic) => epic.features.some((feature) => feature.id === id))
			const isFirstEpic = epicIndex === 0
			const isLastEpic = epicIndex === storyMapState.length - 1
			const features = storyMapState[epicIndex]!.features
			const isFirstFeatureInEpic = id === features[0]!.id
			const isLastFeatureInEpic = id === features.at(-1)!.id

			const containerBoundingRect = element.container.getBoundingClientRect()

			// Set left boundary
			if (isFirstFeatureInEpic) {
				if (isFirstEpic) boundaries.left = 0
				else boundaries.left = epicBoundaries[storyMapState[epicIndex - 1]!.id]!.right
			} else {
				boundaries.left = containerBoundingRect.left - translation[0] + storyMapScrollPosition.position
			}

			// Set right boundary
			if (isLastFeatureInEpic) {
				if (isLastEpic) boundaries.right = Infinity
				else boundaries.right = epicBoundaries[storyMapState[epicIndex + 1]!.id]!.left
			} else {
				boundaries.right = containerBoundingRect.right - translation[0] + storyMapScrollPosition.position
			}

			// Set center boundary
			const contentBoundingRect = element.content.getBoundingClientRect()
			boundaries.center =
				avg(contentBoundingRect.left, contentBoundingRect.right) - translation[0] + storyMapScrollPosition.position
		}
	})

	Object.entries(elementRegistry.stories).forEach(([id, element]: [id: Id, element: HTMLElement | null]) => {
		if (!element) return

		const allFeatures = storyMapState.reduce((acc, {features}) => [...acc, ...features], [])
		const translation = getElementTranslation(element)
		let isLastStory = false
		for (const {stories} of allFeatures) {
			if (id === stories.at(-1)?.id) {
				isLastStory = true
				break
			}
		}

		const boundingRect = element.getBoundingClientRect()
		storyBoundaries[id] = {
			top: boundingRect.top - translation[1] - storyMapTop,
			center: avg(boundingRect.top, boundingRect.bottom) - translation[1] - storyMapTop,
			bottom: isLastStory ? Infinity : boundingRect.bottom - translation[1] - storyMapTop,
		}
	})
}

export const avg = (...arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

export const useSubscribeToData = (): void => {
	const activeProduct = useActiveProductId()
	const setStoryMapState = useSetAtom(storyMapStateAtom)

	useEffect(() => {
		if (activeProduct === null) return

		return onSnapshot(doc(db, Products._, activeProduct), (doc) => {
			const data = ProductSchema.parse({id: doc.id, ...doc.data()})
			setStoryMapState(data.storyMapState)
		})
	}, [activeProduct, setStoryMapState])
}

export const getTargetLocation = (storyMapState: StoryMapState): TargetLocation => {
	calculateBoundaries(storyMapState)

	const x = pointerLocation[0] - (pointerOffset.current?.[0] ?? 0) + storyMapScrollPosition.position
	const y = pointerLocation[1] - (pointerOffset.current?.[1] ?? 0) - storyMapTop

	let hoveringEpicIndex = -1
	let targetEpicIndex = 0
	storyMapState.forEach(({id}, index) => {
		const boundaries = epicBoundaries[id]
		if (!boundaries) return
		if (x >= boundaries.left && x < boundaries.right) hoveringEpicIndex = index
		if (x >= boundaries.center && x < boundaries.right) targetEpicIndex = index + 1
		if (x >= boundaries.left && x < boundaries.center) targetEpicIndex = index
	})

	let hoveringFeatureIndex = -1
	let targetFeatureIndex = 0
	const allFeatures = hoveringEpicIndex >= 0 ? storyMapState[hoveringEpicIndex]!.features : []
	allFeatures.forEach(({id}, index) => {
		const boundaries = featureBoundaries[id]
		if (!boundaries) return
		if (x >= boundaries.left && x < boundaries.right) hoveringFeatureIndex = index
		if (x >= boundaries.center && x < boundaries.right) targetFeatureIndex = index + 1
		if (x >= boundaries.left && x < boundaries.center) targetFeatureIndex = index
	})

	let targetStoryIndex = 0
	const stories =
		hoveringEpicIndex >= 0 && hoveringFeatureIndex >= 0
			? storyMapState[hoveringEpicIndex]!.features[hoveringFeatureIndex]!.stories
			: []
	stories.forEach(({id}, index) => {
		const boundaries = storyBoundaries[id]
		if (!boundaries) return
		if (y >= boundaries.top && y < boundaries.center) targetStoryIndex = index
		if (y >= boundaries.center && y < boundaries.bottom) targetStoryIndex = index + 1
	})

	return {
		epic: y < layerBoundaries[0] ? targetEpicIndex : hoveringEpicIndex,
		feature: y > layerBoundaries[0] ? (y < layerBoundaries[1] ? targetFeatureIndex : hoveringFeatureIndex) : null,
		story: y > layerBoundaries[1] ? targetStoryIndex : null,
	}
}

export const convertEpicToFeature = (epic: Epic): Feature => ({
	id: epic.id,
	description: epic.description,
	name: epic.name,
	priority_level: 0,
	visibility_level: 0,
	comments: epic.comments,
	nameInputStateId: epic.nameInputStateId,
	stories: epic.features.flatMap(({stories}) => stories),
})

export const convertEpicToStory = (epic: Epic, versionId: Id): Story => ({
	id: epic.id,
	acceptance_criteria: [],
	code_link: null,
	description: epic.description,
	design_link: null,
	name: epic.name,
	points: 0,
	priority_level: 0,
	visibility_level: 0,
	comments: epic.comments,
	nameInputStateId: epic.nameInputStateId,
	versionId,
})

export const convertFeatureToEpic = (feature: Feature): Epic => ({
	id: feature.id,
	description: feature.description,
	name: feature.name,
	priority_level: feature.priority_level,
	visibility_level: feature.visibility_level,
	comments: feature.comments,
	keepers: [],
	nameInputStateId: feature.nameInputStateId,
	features: feature.stories.map(convertStoryToFeature),
})

export const convertFeatureToStory = (feature: Feature, versionId: Id): Story => ({
	id: feature.id,
	acceptance_criteria: [],
	code_link: null,
	description: feature.description,
	design_link: null,
	name: feature.name,
	points: 0,
	priority_level: feature.priority_level,
	visibility_level: feature.visibility_level,
	comments: feature.comments,
	nameInputStateId: feature.nameInputStateId,
	versionId,
})

export const convertStoryToEpic = (story: Story): Epic => ({
	id: story.id,
	description: story.description,
	name: story.name,
	priority_level: story.priority_level,
	visibility_level: story.visibility_level,
	comments: story.comments,
	keepers: [],
	nameInputStateId: story.nameInputStateId,
	features: [],
})

export const convertStoryToFeature = (story: Story): Feature => ({
	id: story.id,
	description: story.description,
	name: story.name,
	priority_level: story.priority_level,
	visibility_level: story.visibility_level,
	comments: story.comments,
	nameInputStateId: story.nameInputStateId,
	stories: [],
})

export const moveEpic = (
	originalState: StoryMapState,
	epicId: Id,
	targetLocation: TargetLocation,
	currentVersionId: Id | `__ALL_VERSIONS__`,
): StoryMapState =>
	produce(originalState, (state) => {
		if (targetLocation.epic !== null && targetLocation.feature !== null && targetLocation.story !== null) {
			const epicIndex = state.findIndex(({id}) => id === epicId)
			const epic = state[epicIndex]!

			if (
				// Epics should only be allowed to move to stories if they don't have any features
				epic.features.length > 0 ||
				// Version must be selected to create a story
				currentVersionId === `__ALL_VERSIONS__` ||
				// Don't allow epic to be moved into itself
				epicIndex === targetLocation.epic
			)
				return

			// Insert the epic at story location
			const storiesOrder = state[targetLocation.epic]!.features[targetLocation.feature]!.stories
			storiesOrder.splice(targetLocation.story, 0, convertEpicToStory(epic, currentVersionId))

			// Remove the epic from its original location
			state.splice(epicIndex, 1)
		} else if (
			targetLocation.epic !== null &&
			targetLocation.feature !== null &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0
		) {
			const epicIndex = state.findIndex(({id}) => id === epicId)
			const epic = state[epicIndex]!
			const features = state[targetLocation.epic]!.features

			// Don't allow epic to be moved into itself
			if (epicIndex === targetLocation.epic) return

			// Insert the new feature at feature location
			features.splice(targetLocation.feature, 0, convertEpicToFeature(epic))

			// Remove the epic from its original location
			state.splice(epicIndex, 1)
		} else if (targetLocation.epic !== null && targetLocation.epic >= 0) {
			const epicIndex = state.findIndex(({id}) => id === epicId)
			const epic = state[epicIndex]!

			// Insert the epic at new location
			state.splice(targetLocation.epic, 0, epic)

			// Remove the epic from its original location
			state.splice(epicIndex + (epicIndex > targetLocation.epic ? 1 : 0), 1)
		}
	})

export const moveFeature = (
	originalState: StoryMapState,
	featureId: Id,
	targetLocation: TargetLocation,
	currentVersionId: Id | `__ALL_VERSIONS__`,
): StoryMapState =>
	produce(originalState, (state) => {
		let epicIndex = -1
		let featureIndex = -1
		epicLoop: for (const [i, epic] of state.entries()) {
			for (const [j, feature] of epic.features.entries()) {
				if (feature.id === featureId) {
					epicIndex = i
					featureIndex = j
					break epicLoop
				}
			}
		}
		const feature = state[epicIndex]!.features[featureIndex]!

		if (
			targetLocation.epic !== null &&
			targetLocation.feature !== null &&
			targetLocation.story !== null &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0 &&
			targetLocation.story >= 0
		) {
			const stories = state[targetLocation.epic]!.features[targetLocation.feature]!.stories

			if (
				// Version must be selected to create a story
				currentVersionId === `__ALL_VERSIONS__` ||
				// Don't allow feature to be moved into itself
				featureIndex === targetLocation.feature
			)
				return

			// Insert the feature at story location
			stories.splice(targetLocation.story, 0, convertFeatureToStory(feature, currentVersionId))

			// Remove the feature from its original location
			state[epicIndex]!.features.splice(featureIndex, 1)
		} else if (
			targetLocation.epic !== null &&
			targetLocation.feature !== null &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0
		) {
			// Insert the new feature at feature location
			state[targetLocation.epic]!.features.splice(targetLocation.feature, 0, feature)

			// Remove the feature from its original location
			if (targetLocation.epic === epicIndex) {
				state[epicIndex]!.features.splice(featureIndex + (featureIndex > targetLocation.feature ? 1 : 0), 1)
			} else {
				state[epicIndex]!.features.splice(featureIndex, 1)
			}
		} else if (targetLocation.epic !== null && targetLocation.epic >= 0) {
			// Insert the feature at new location
			state.splice(targetLocation.epic, 0, convertFeatureToEpic(feature))

			// Remove the feature from its original location
			state[epicIndex]!.features.splice(featureIndex, 1)
		}
	})

export const moveStory = (originalState: StoryMapState, storyId: Id, targetLocation: TargetLocation): StoryMapState =>
	produce(originalState, (state) => {
		let epicIndex = -1
		let featureIndex = -1
		let storyIndex = -1
		epicLoop: for (const [i, epic] of state.entries()) {
			for (const [j, feature] of epic.features.entries()) {
				for (const [k, story] of feature.stories.entries()) {
					if (story.id === storyId) {
						epicIndex = i
						featureIndex = j
						storyIndex = k
						break epicLoop
					}
				}
			}
		}
		const story = state[epicIndex]!.features[featureIndex]!.stories[storyIndex]!

		if (
			targetLocation.epic !== null &&
			targetLocation.feature !== null &&
			targetLocation.story !== null &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0 &&
			targetLocation.story >= 0
		) {
			const stories = state[targetLocation.epic]!.features[targetLocation.feature]!.stories

			// Insert the story at story location
			stories.splice(targetLocation.story, 0, story)

			// Remove the story from its original location
			if (targetLocation.epic === epicIndex && targetLocation.feature === featureIndex) {
				stories.splice(storyIndex + (storyIndex > targetLocation.story ? 1 : 0), 1)
			} else {
				stories.splice(storyIndex, 1)
			}
		} else if (
			targetLocation.epic !== null &&
			targetLocation.feature !== null &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0
		) {
			// Insert the new story at feature location
			state[targetLocation.epic]!.features.splice(targetLocation.feature, 0, convertStoryToFeature(story))

			// Remove the story from its original location
			state[epicIndex]!.features[featureIndex]!.stories.splice(storyIndex, 1)
		} else if (targetLocation.epic !== null && targetLocation.epic >= 0) {
			// Insert the story at new location
			state.splice(targetLocation.epic, 0, convertStoryToEpic(story))

			// Remove the story from its original location
			state[epicIndex]!.features[featureIndex]!.stories.splice(storyIndex, 1)
		}
	})
