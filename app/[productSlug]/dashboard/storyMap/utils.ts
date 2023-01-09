import {collection, doc, onSnapshot, query, where} from "firebase9/firestore"
import {useSetAtom} from "jotai"
import {useEffect} from "react"

import type {StoryMapState} from "./atoms"
import type {Id} from "~/types"

import {epicsAtom, featuresAtom, storiesAtom, storyMapStateAtom} from "./atoms"
import {db} from "~/config/firebase"
import {EpicSchema, Epics} from "~/types/db/Epics"
import {FeatureSchema, Features} from "~/types/db/Features"
import {Products, ProductSchema} from "~/types/db/Products"
import {StorySchema, Stories} from "~/types/db/Stories"
import objectEntries from "~/utils/objectEntries"
import {useActiveProductId} from "~/utils/useActiveProductId"

const storyMapTop = 216

type TargetPosition = {
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
		__targetPosition: TargetPosition
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
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__targetPosition = window.__targetPosition ?? {
		epic: null,
		feature: null,
		story: null,
	}
}

export let storyMapScrollPosition = window.__storyMapScrollPosition
export let elementRegistry = window.__elementRegistry
export const layerBoundaries: [number, number] = [62, 164]
export let epicBoundaries = window.__epicBoundaries
export let featureBoundaries = window.__featureBoundaries
export let storyBoundaries = window.__storyBoundaries
export let pointerLocation = window.__pointerLocation
export let pointerOffset = window.__pointerOffset
export let targetPosition = window.__targetPosition

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
			const isFirstEpic = id === storyMapState[0]!.epic
			const isLastEpic = id === storyMapState[storyMapState.length - 1]!.epic

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
			const epicIndex = storyMapState.findIndex(({featuresOrder}) => featuresOrder.some(({feature}) => feature === id))
			const isFirstEpic = epicIndex === 0
			const isLastEpic = epicIndex === storyMapState.length - 1
			const featuresOrder = storyMapState[epicIndex]!.featuresOrder
			const isFirstFeatureInEpic = id === featuresOrder[0]!.feature
			const isLastFeatureInEpic = id === featuresOrder.at(-1)!.feature

			const containerBoundingRect = element.container.getBoundingClientRect()

			// Set left boundary
			if (isFirstFeatureInEpic) {
				if (isFirstEpic) boundaries.left = 0
				else boundaries.left = epicBoundaries[storyMapState[epicIndex - 1]!.epic]!.right
			} else {
				boundaries.left = containerBoundingRect.left - translation[0] + storyMapScrollPosition.position
			}

			// Set right boundary
			if (isLastFeatureInEpic) {
				if (isLastEpic) boundaries.right = Infinity
				else boundaries.right = epicBoundaries[storyMapState[epicIndex + 1]!.epic]!.left
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
		const allFeatures = storyMapState.reduce((acc, {featuresOrder}) => [...acc, ...featuresOrder], [])

		if (element) {
			const translation = getElementTranslation(element)
			let isLastStory = false
			for (const {storiesOrder} of allFeatures) {
				if (id === storiesOrder.at(-1)?.story) {
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

	const setEpics = useSetAtom(epicsAtom)
	const setFeatures = useSetAtom(featuresAtom)
	const setStories = useSetAtom(storiesAtom)
	const setStoryMapState = useSetAtom(storyMapStateAtom)

	useEffect(() => {
		if (activeProduct === null) return

		const unsubscribeEpics = onSnapshot(
			query(collection(db, Epics._), where(Epics.product, `==`, activeProduct)),
			(doc) => {
				const data = EpicSchema.array().parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setEpics(data)
			},
		)

		const unsubscribeFeatures = onSnapshot(
			query(collection(db, Features._), where(Features.product, `==`, activeProduct)),
			(doc) => {
				const data = FeatureSchema.array().parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setFeatures(data)
			},
		)

		const unsubscribeStories = onSnapshot(
			query(collection(db, Stories._), where(Stories.product, `==`, activeProduct)),
			(doc) => {
				const data = StorySchema.array().parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setStories(data)
			},
		)

		const unsubscribeStoryMapState = onSnapshot(doc(db, Products._, activeProduct), (doc) => {
			const data = ProductSchema.parse({id: doc.id, ...doc.data()})
			setStoryMapState(data.storyMapState)
		})

		return () => {
			unsubscribeEpics()
			unsubscribeFeatures()
			unsubscribeStories()
			unsubscribeStoryMapState()
		}
	}, [activeProduct, setEpics, setFeatures, setStories, setStoryMapState])
}

export const getTargetPosition = (storyMapState: StoryMapState): TargetPosition => {
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
		hoveringEpicIndex = storyMapState.findIndex(({epic}) => epic === epicId)
		targetEpicIndex = hoveringEpicIndex + 1
	} else if (rightEpicBoundaries) {
		const epicId = rightEpicBoundaries[0]
		targetEpicIndex = hoveringEpicIndex = storyMapState.findIndex(({epic}) => epic === epicId)
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
		hoveringFeatureIndex = storyMapState[hoveringEpicIndex]!.featuresOrder.findIndex(
			({feature}) => feature === featureId,
		)
		targetFeatureIndex = hoveringFeatureIndex + 1
	} else if (rightFeatureBoundaries) {
		const featureId = rightFeatureBoundaries[0]
		targetFeatureIndex = hoveringFeatureIndex = storyMapState[hoveringEpicIndex]!.featuresOrder.findIndex(
			({feature}) => feature === featureId,
		)
	}

	const storiesOrder =
		hoveringEpicIndex >= 0 && hoveringFeatureIndex >= 0
			? storyMapState[hoveringEpicIndex]!.featuresOrder[hoveringFeatureIndex]!.storiesOrder
			: []
	const allStoryBoundaries = storiesOrder
		.map(({story}) => [story, storyBoundaries[story]])
		.filter(([, boundaries]) => !!boundaries) as Array<[Id, {top: number; center: number; bottom: number}]>
	const topStoryBoundaries = allStoryBoundaries.find(([, boundaries]) => y > boundaries.center && y < boundaries.bottom)
	const bottomStoryBoundaries = allStoryBoundaries.find(
		([, boundaries]) => y >= boundaries.top && y < boundaries.center,
	)
	let targetStoryIndex = -1
	if (topStoryBoundaries) {
		const storyId = topStoryBoundaries[0]
		targetStoryIndex = storiesOrder.findIndex(({story}) => story === storyId) + 1
	} else if (bottomStoryBoundaries) {
		const storyId = bottomStoryBoundaries[0]
		targetStoryIndex = storiesOrder.findIndex(({story}) => story === storyId)
	}

	targetPosition = {
		epic: targetEpicIndex >= 0 ? targetEpicIndex : null,
		feature: y > layerBoundaries[0] && targetFeatureIndex >= 0 ? targetFeatureIndex : null,
		story: y > layerBoundaries[1] && targetStoryIndex >= 0 ? targetStoryIndex : null,
	}

	const indicator = document.getElementById(`indicator`)
	if (indicator) {
		const epicId = targetPosition.epic !== null ? storyMapState[targetEpicIndex]!.epic : null
		const featureId =
			targetPosition.feature !== null
				? storyMapState[hoveringEpicIndex]!.featuresOrder[targetFeatureIndex]!.feature
				: null
		const storyId =
			targetPosition.story !== null
				? storyMapState[hoveringEpicIndex]!.featuresOrder[hoveringFeatureIndex]!.storiesOrder[targetStoryIndex]!.story
				: null

		if (storyId && featureId) {
			indicator.style.top = `${storyBoundaries[storyId]!.top + storyMapTop}px`
			indicator.style.left = `${featureBoundaries[featureId]!.left - storyMapScrollPosition.position}px`
			indicator.style.width = `${featureBoundaries[featureId]!.right - featureBoundaries[featureId]!.left}px`
			indicator.style.height = `${storyBoundaries[storyId]!.bottom - storyBoundaries[storyId]!.top}px`
		} else if (featureId) {
			indicator.style.top = `${layerBoundaries[0] + storyMapTop}px`
			indicator.style.left = `${featureBoundaries[featureId]!.left - storyMapScrollPosition.position}px`
			indicator.style.width = `${featureBoundaries[featureId]!.right - featureBoundaries[featureId]!.left}px`
			indicator.style.height = `${layerBoundaries[1] - layerBoundaries[0]}px`
		} else if (epicId) {
			indicator.style.top = `${storyMapTop}px`
			indicator.style.left = `${epicBoundaries[epicId]!.left - storyMapScrollPosition.position}px`
			indicator.style.width = `${epicBoundaries[epicId]!.right - epicBoundaries[epicId]!.left}px`
			indicator.style.height = `${layerBoundaries[0]}px`
		}
	}

	return targetPosition
}
