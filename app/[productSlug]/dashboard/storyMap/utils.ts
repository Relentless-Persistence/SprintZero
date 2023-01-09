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

declare global {
	interface Window {
		__storyMapScrollPosition: {position: number}
		__elementRegistry: {
			epics: Record<Id, {content: HTMLElement | null; container: HTMLElement | null}>
			features: Record<Id, {content: HTMLElement | null; container: HTMLElement | null}>
			stories: Record<Id, HTMLElement | null>
		}
		__epicDividers: Record<Id, {left: number; center: number; right: number}>
		__featureDividers: Record<Id, {left: number; center: number; right: number}>
		__storyDividers: Record<Id, {top: number; center: number; bottom: number}>
		__cursorLocationPixels: [number, number]
		__cursorLocation: {
			epic: {index: number; id: Id | null} | null
			feature: {index: number; id: Id | null} | null
			story: {index: number; id: Id | null} | null
		}
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
	window.__epicDividers = window.__epicDividers ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__featureDividers = window.__featureDividers ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__storyDividers = window.__storyDividers ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__cursorLocationPixels = window.__cursorLocationPixels ?? [0, 0]
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__cursorLocation = window.__cursorLocation ?? {
		epic: null,
		feature: null,
		story: null,
	}
}

export let storyMapScrollPosition = window.__storyMapScrollPosition
export let elementRegistry = window.__elementRegistry
export const layerBoundaries: [number, number] = [62, 164]
export let epicDividers = window.__epicDividers
export let featureDividers = window.__featureDividers
export let storyDividers = window.__storyDividers
export let cursorLocationPixels = window.__cursorLocationPixels
export let cursorLocation = window.__cursorLocation

export const calculateDividers = (storyMapState: StoryMapState): void => {
	Object.entries(elementRegistry.epics).forEach(([id, element]) => {
		// Initialize the divider if it doesn't exist
		if (!epicDividers[id as Id]) epicDividers[id as Id] = {left: 0, center: 0, right: 0}

		const divider = epicDividers[id as Id]!

		if (element.content && element.container?.getAttribute(`data-is-being-dragged`) === `false`) {
			const boundingRect = element.content.getBoundingClientRect()
			divider.center = avg(boundingRect.left, boundingRect.right) + storyMapScrollPosition.position
		}

		if (element.container && element.container.getAttribute(`data-is-being-dragged`) === `false`) {
			const isFirstEpic = id === storyMapState[0]!.epic
			const isLastEpic = id === storyMapState[storyMapState.length - 1]!.epic

			const boundingRect = element.container.getBoundingClientRect()
			divider.left = isFirstEpic ? 0 : boundingRect.left + storyMapScrollPosition.position
			divider.right = isLastEpic ? Infinity : boundingRect.right + storyMapScrollPosition.position
		}
	})

	Object.entries(elementRegistry.features).forEach(([id, element]) => {
		if (!featureDividers[id as Id]) featureDividers[id as Id] = {left: 0, center: 0, right: 0}
		const divider = featureDividers[id as Id]!

		if (element.content && element.container?.getAttribute(`data-is-being-dragged`) === `false`) {
			const boundingRect = element.content.getBoundingClientRect()
			divider.center = avg(boundingRect.left, boundingRect.right) + storyMapScrollPosition.position
		}

		if (element.container && element.container.getAttribute(`data-is-being-dragged`) === `false`) {
			const epicIndex = storyMapState.findIndex(({featuresOrder}) => featuresOrder.some(({feature}) => feature === id))
			const isFirstEpic = epicIndex === 0
			const isLastEpic = epicIndex === storyMapState.length - 1
			const featuresOrder = storyMapState[epicIndex]!.featuresOrder
			const isFirstFeatureInEpic = id === featuresOrder[0]!.feature
			const isLastFeatureInEpic = id === featuresOrder.at(-1)!.feature

			const boundingRect = element.container.getBoundingClientRect()
			const left = boundingRect.left + storyMapScrollPosition.position
			const right = boundingRect.right + storyMapScrollPosition.position
			if (isFirstFeatureInEpic) {
				if (isFirstEpic) divider.left = 0
				else divider.left = epicDividers[storyMapState[epicIndex - 1]!.epic]!.right
			} else {
				divider.left = left
			}
			if (isLastFeatureInEpic) {
				if (isLastEpic) divider.right = Infinity
				else divider.right = epicDividers[storyMapState[epicIndex + 1]!.epic]!.left
			} else {
				divider.right = right
			}
		}
	})

	Object.entries(elementRegistry.stories).forEach(([id, element]: [id: Id, element: HTMLElement | null]) => {
		const allFeatures = storyMapState.reduce((acc, {featuresOrder}) => [...acc, ...featuresOrder], [])

		if (element && element.getAttribute(`data-is-being-dragged`) === `false`) {
			let isLastStory = false
			for (const {storiesOrder} of allFeatures) {
				if (id === storiesOrder.at(-1)?.story) {
					isLastStory = true
					break
				}
			}

			const boundingRect = element.getBoundingClientRect()
			storyDividers[id] = {
				top: boundingRect.top - storyMapTop,
				center: avg(boundingRect.top, boundingRect.bottom) - storyMapTop,
				bottom: isLastStory ? Infinity : boundingRect.bottom - storyMapTop,
			}
		} else {
			delete storyDividers[id]
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

export const updateCursorLocation = (storyMapState: StoryMapState): void => {
	const x = cursorLocationPixels[0] + storyMapScrollPosition.position
	const y = cursorLocationPixels[1] - storyMapTop

	const epicId = objectEntries(epicDividers).find(([, divider]) => x > divider.left && x < divider.right)?.[0] ?? null
	const featureId =
		objectEntries(featureDividers).find(([, divider]) => x > divider.left && x < divider.right)?.[0] ?? null

	const epicIndex = storyMapState.findIndex(({epic}) => epic === epicId)
	const featureIndex =
		epicIndex >= 0 ? storyMapState[epicIndex]!.featuresOrder.findIndex(({feature}) => feature === featureId) : -1

	const storiesOrder =
		epicIndex >= 0 && featureIndex >= 0 ? storyMapState[epicIndex]!.featuresOrder[featureIndex]!.storiesOrder : []
	const storyId =
		storiesOrder
			.map(({story}) => [story, storyDividers[story]] as const)
			.filter(([, divider]) => !!divider)
			.find(([, divider]) => y > divider!.top && y < divider!.bottom)?.[0] ?? null
	const storyIndex = storiesOrder.findIndex(({story}) => story === storyId)

	cursorLocation = {
		epic: epicId ? {index: epicIndex, id: epicId} : null,
		feature: y > layerBoundaries[0] ? {index: featureIndex, id: featureId} : null,
		story: y > layerBoundaries[1] ? {index: storyIndex, id: storyId} : null,
	}

	const indicator = document.getElementById(`indicator`)
	if (indicator) {
		const epicId = cursorLocation.epic?.id
		const featureId = cursorLocation.feature?.id
		const storyId = cursorLocation.story?.id

		if (storyId && featureId) {
			indicator.style.top = `${storyDividers[storyId]!.top + storyMapTop}px`
			indicator.style.left = `${featureDividers[featureId]!.left - storyMapScrollPosition.position}px`
			indicator.style.width = `${featureDividers[featureId]!.right - featureDividers[featureId]!.left}px`
			indicator.style.height = `${storyDividers[storyId]!.bottom - storyDividers[storyId]!.top}px`
		} else if (featureId) {
			indicator.style.top = `${layerBoundaries[0] + storyMapTop}px`
			indicator.style.left = `${featureDividers[featureId]!.left - storyMapScrollPosition.position}px`
			indicator.style.width = `${featureDividers[featureId]!.right - featureDividers[featureId]!.left}px`
			indicator.style.height = `${layerBoundaries[1] - layerBoundaries[0]}px`
		} else if (epicId) {
			indicator.style.top = `${storyMapTop}px`
			indicator.style.left = `${epicDividers[epicId]!.left - storyMapScrollPosition.position}px`
			indicator.style.width = `${epicDividers[epicId]!.right - epicDividers[epicId]!.left}px`
			indicator.style.height = `${layerBoundaries[0]}px`
		}
	}
}
