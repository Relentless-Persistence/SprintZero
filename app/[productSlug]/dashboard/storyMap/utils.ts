import {doc, onSnapshot} from "firebase9/firestore"
import produce from "immer"
import {useSetAtom} from "jotai"
import {useEffect} from "react"

import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/Products"

import {storyMapStateAtom} from "./atoms"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import objectEntries from "~/utils/objectEntries"
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
			const epicIndex = storyMapState.findIndex((epic) => epic.id === id)
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
		const allFeatures = storyMapState.reduce((acc, {features}) => [...acc, ...features], [])

		if (element) {
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
		} else {
			delete storyBoundaries[id]
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
	const x = pointerLocation[0] - (pointerOffset.current?.[0] ?? 0) + storyMapScrollPosition.position
	const y = pointerLocation[1] - (pointerOffset.current?.[1] ?? 0) - storyMapTop

	const leftEpicBoundaries = objectEntries(epicBoundaries).find(
		([, boundaries]) => x > boundaries.center && x < boundaries.right,
	)
	const rightEpicBoundaries = objectEntries(epicBoundaries).find(
		([, boundaries]) => x >= boundaries.left && x < boundaries.center,
	)

	let hoveringEpicIndex = -1
	let targetEpicIndex = -1
	if (leftEpicBoundaries) {
		const epicId = leftEpicBoundaries[0]
		hoveringEpicIndex = storyMapState.findIndex(({id}) => id === epicId)
		targetEpicIndex = hoveringEpicIndex + 1
	} else if (rightEpicBoundaries) {
		const epicId = rightEpicBoundaries[0]
		targetEpicIndex = hoveringEpicIndex = storyMapState.findIndex(({id}) => id === epicId)
	}

	const leftFeatureBoundaries = objectEntries(featureBoundaries).find(
		([, boundaries]) => x > boundaries.center && x < boundaries.right,
	)
	const rightFeatureBoundaries = objectEntries(featureBoundaries).find(
		([, boundaries]) => x >= boundaries.left && x < boundaries.center,
	)

	let hoveringFeatureIndex = -1
	let targetFeatureIndex = -1
	if (leftFeatureBoundaries) {
		const featureId = leftFeatureBoundaries[0]
		hoveringFeatureIndex = storyMapState[hoveringEpicIndex]!.features.findIndex(({id}) => id === featureId)
		targetFeatureIndex = hoveringFeatureIndex + 1
	} else if (rightFeatureBoundaries) {
		const featureId = rightFeatureBoundaries[0]
		targetFeatureIndex = hoveringFeatureIndex = storyMapState[hoveringEpicIndex]!.features.findIndex(
			({id}) => id === featureId,
		)
	}

	const stories =
		hoveringEpicIndex >= 0 && hoveringFeatureIndex >= 0
			? storyMapState[hoveringEpicIndex]!.features[hoveringFeatureIndex]!.stories
			: []
	const allStoryBoundaries = stories
		.map(({id}) => [id, storyBoundaries[id]])
		.filter(([, boundaries]) => !!boundaries) as Array<[Id, {top: number; center: number; bottom: number}]>
	const topStoryBoundaries = allStoryBoundaries.find(([, boundaries]) => y > boundaries.center && y < boundaries.bottom)
	const bottomStoryBoundaries = allStoryBoundaries.find(
		([, boundaries]) => y >= boundaries.top && y < boundaries.center,
	)
	let targetStoryIndex = -1
	if (topStoryBoundaries) {
		const storyId = topStoryBoundaries[0]
		targetStoryIndex = stories.findIndex(({id}) => id === storyId) + 1
	} else if (bottomStoryBoundaries) {
		const storyId = bottomStoryBoundaries[0]
		targetStoryIndex = stories.findIndex(({id}) => id === storyId)
	}

	return {
		epic: targetEpicIndex >= 0 ? targetEpicIndex : null,
		feature: y > layerBoundaries[0] && targetFeatureIndex >= 0 ? targetFeatureIndex : null,
		story: y > layerBoundaries[1] && targetStoryIndex >= 0 ? targetStoryIndex : null,
	}
}

export const moveEpic = (originalState: StoryMapState, epicId: Id, targetLocation: TargetLocation): StoryMapState =>
	produce(originalState, (state) => {
		if (targetLocation.epic !== null && targetLocation.feature !== null && targetLocation.story !== null) {
			// Epics should only be allowed to move to stories if they don't have any features
			const epic = state.find(({id}) => id === epicId)!
			if (epic.features.length > 0) return

			// Insert the epic at story location
			const storiesOrder = state[targetLocation.epic]!.features[targetLocation.feature]!.stories
			storiesOrder.splice(targetLocation.story, 0, {story: epicId})

			// Remove the epic from its original location
			state = state.filter(({id}) => id !== epicId)
		} else if (targetLocation.epic !== null && targetLocation.feature !== null) {
			const features = state[targetLocation.epic]!.features
			const allStories = features.flatMap(({stories}) => stories)
			const newFeaturesOrder = {
				id: epicId,
				stories: allStories,
			}

			// Insert the new feature at feature location
			features.splice(targetLocation.feature, 0, newFeaturesOrder)

			// Remove the epic from its original location
			state = state.filter(({id}) => id !== epicId)
		} else if (targetLocation.epic !== null) {
			const epicIndex = state.findIndex(({id}) => id === epicId)
			const epic = state[epicIndex]!

			// Insert the epic at new location
			state.splice(targetLocation.epic, 0, epic)

			// Remove the epic from its original location
			state.splice(epicIndex + (epicIndex > targetLocation.epic ? 1 : 0), 1)
		}
	})
