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
}

export let storyMapScrollPosition = window.__storyMapScrollPosition
export let elementRegistry = window.__elementRegistry
export const layerBoundaries: [number, number] = [54, 156]
export let epicDividers = window.__epicDividers
export let featureDividers = window.__featureDividers
export let storyDividers = window.__storyDividers

export const calculateDividers = (): void => {
	Object.entries(elementRegistry.epics).forEach(([id, element]) => {
		if (!epicDividers[id as Id]) epicDividers[id as Id] = {left: 0, center: 0, right: 0}
		const divider = epicDividers[id as Id]!

		if (element.content) {
			const boundingRect = element.content.getBoundingClientRect()
			divider.center = avg(boundingRect.left, boundingRect.right) + storyMapScrollPosition.position
		}

		if (element.container) {
			const boundingRect = element.container.getBoundingClientRect()
			divider.left = boundingRect.left + storyMapScrollPosition.position
			divider.right = boundingRect.right + storyMapScrollPosition.position
		}
	})

	Object.entries(elementRegistry.features).forEach(([id, element]) => {
		if (!featureDividers[id as Id]) featureDividers[id as Id] = {left: 0, center: 0, right: 0}
		const divider = featureDividers[id as Id]!

		if (element.content) {
			const boundingRect = element.content.getBoundingClientRect()
			divider.center = avg(boundingRect.left, boundingRect.right) + storyMapScrollPosition.position
		}

		if (element.container) {
			const boundingRect = element.container.getBoundingClientRect()
			divider.left = boundingRect.left + storyMapScrollPosition.position
			divider.right = boundingRect.right + storyMapScrollPosition.position
		}
	})

	Object.entries(elementRegistry.stories).forEach(([id, element]: [id: Id, element: HTMLElement | null]) => {
		if (element) {
			const boundingRect = element.getBoundingClientRect()
			storyDividers[id] = {
				top: boundingRect.top - storyMapTop,
				center: avg(boundingRect.top, boundingRect.bottom) - storyMapTop,
				bottom: boundingRect.bottom - storyMapTop,
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

type WhereIsMyCursorReturn = {
	epic: {index: number; id: Id | null} | null
	feature: {index: number; id: Id | null} | null
	story: {index: number; id: Id | null} | null
}

export const whereIsMyCusror = (x: number, y: number, storyMapState: StoryMapState): WhereIsMyCursorReturn => {
	const xAdj = x + storyMapScrollPosition.position
	const yAdj = y - storyMapTop

	const epicId =
		objectEntries(epicDividers).find(([, divider]) => xAdj > divider.left && xAdj < divider.right)?.[0] ?? null
	const featureId =
		objectEntries(featureDividers).find(([, divider]) => xAdj > divider.left && xAdj < divider.right)?.[0] ?? null

	const epicIndex = storyMapState.findIndex(({epic}) => epic === epicId)
	const featureIndex =
		epicIndex >= 0 ? storyMapState[epicIndex]!.featuresOrder.findIndex(({feature}) => feature === featureId) : -1

	const storiesOrder =
		epicIndex >= 0 && featureIndex >= 0 ? storyMapState[epicIndex]!.featuresOrder[featureIndex]!.storiesOrder : []
	const storyId =
		storiesOrder
			.map(({story}) => [story, storyDividers[story]] as const)
			.filter(([, divider]) => !!divider)
			.find(([, divider]) => yAdj > divider!.top && yAdj < divider!.bottom)?.[0] ?? null
	const storyIndex = storiesOrder.findIndex(({story}) => story === storyId)

	const r = {
		epic: epicId ? {index: epicIndex, id: epicId} : null,
		feature: yAdj > layerBoundaries[0] ? {index: featureIndex, id: featureId} : null,
		story: yAdj > layerBoundaries[1] ? {index: storyIndex, id: storyId} : null,
	}

	if (r.story) {
		console.log(`epic ${epicIndex}, feature ${featureIndex}, story ${storyIndex}`)
	} else if (r.feature) {
		console.log(`epic ${epicIndex}, feature ${featureIndex}`)
	} else {
		console.log(`epic ${epicIndex}`)
	}

	return r
}
