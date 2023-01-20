import {doc, onSnapshot} from "firebase9/firestore"
import {useAtomValue, useSetAtom} from "jotai"
import {sortBy} from "lodash"
import {useEffect} from "react"

import type {CurrentVersionId, EpicMeta, FeatureMeta, StoryMapMeta, StoryMeta} from "./types"
import type {Id} from "~/types"
import type {Epic, Feature, StoryMapState} from "~/types/db/Products"

import {currentVersionAtom, storyMapStateAtom} from "../atoms"
import {boundaries, elementRegistry, layerBoundaries, storyMapMeta, storyMapScrollPosition} from "./globals"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {useActiveProductId} from "~/utils/useActiveProductId"

export const avg = (...arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

export const useSubscribeToData = (): void => {
	const activeProductId = useActiveProductId()
	const setStoryMapState = useSetAtom(storyMapStateAtom)
	const currentVersion = useAtomValue(currentVersionAtom)

	useEffect(() => {
		if (!activeProductId) return

		return onSnapshot(doc(db, Products._, activeProductId), (doc) => {
			const data = ProductSchema.parse({id: doc.id, ...doc.data()})
			setStoryMapState(data.storyMapState)
			genStoryMapMeta(data.storyMapState, currentVersion.id)
		})
	}, [activeProductId, currentVersion.id, setStoryMapState])
}

export const sortEpics = (epics: Epic[]): Epic[] => sortBy(epics, [(epic: Epic) => epic.userValue])
export const sortFeatures = (storyMapState: StoryMapState, featureIds: Id[]): Id[] =>
	sortBy(
		featureIds.map((id) => storyMapState.features.find((feature) => feature.id === id)!),
		[(feature: Feature) => feature.userValue],
	).map((feature) => feature.id)

const genStoryMapMeta = (storyMapState: StoryMapState, currentVersionId: CurrentVersionId): void => {
	const meta: StoryMapMeta = {}
	storyMapState.epics.forEach((epic, i) => {
		meta[epic.id] = {
			type: `epic`,
			parent: undefined,
			children: epic.featureIds,
			position: i,
			prevItem: i === 0 ? undefined : storyMapState.epics[i - 1]!.id,
			nextItem: i === storyMapState.epics.length - 1 ? undefined : storyMapState.epics[i + 1]!.id,
		}

		epic.featureIds.forEach((featureId, j) => {
			meta[featureId] = {
				...(meta[featureId] as FeatureMeta),
				parent: epic.id,
				position: j,
				prevItem: j === 0 ? undefined : epic.featureIds[j - 1],
				nextItem: j === epic.featureIds.length - 1 ? undefined : epic.featureIds[j + 1],
			}
		})
	})

	storyMapState.features.forEach((feature: Feature) => {
		meta[feature.id] = {
			...(meta[feature.id] as any),
			type: `feature`,
			children: feature.storyIds,
		}

		const currentVersionStories = feature.storyIds.filter(
			(storyId) =>
				currentVersionId === `__ALL_VERSIONS__` ||
				storyMapState.stories.find((story) => story.id === storyId)!.versionId === currentVersionId,
		)
		currentVersionStories.forEach((storyId, j) => {
			meta[storyId] = {
				type: `story`,
				parent: feature.id,
				children: undefined,
				position: j,
				prevItem: j === 0 ? undefined : currentVersionStories[j - 1],
				nextItem: j === currentVersionStories.length - 1 ? undefined : currentVersionStories[j + 1],
			}
		})
	})

	storyMapMeta.current = meta
}

export const meta = <T extends `epic` | `feature` | `story` | `unknown` = `unknown`>(
	id: Id,
): T extends `epic` ? EpicMeta : T extends `feature` ? FeatureMeta : T extends `story` ? StoryMeta : StoryMapMeta[Id] =>
	storyMapMeta.current[id] as any

const getElementTranslation = (element: HTMLElement): [number, number] => {
	const style = window.getComputedStyle(element)
	const matrix = new DOMMatrix(style.transform)
	return [matrix.m41, matrix.m42]
}

export const calculateBoundaries = (storyMapState: StoryMapState, currentVersionId: CurrentVersionId): void => {
	// Make sure all story map items have registered their DOM elements in elementRegistry
	const allElementsRegistered = [
		...storyMapState.epics,
		...storyMapState.features,
		...storyMapState.stories.filter(
			(story) => currentVersionId === `__ALL_VERSIONS__` || story.versionId === currentVersionId,
		),
	].every(({id}) => elementRegistry[id])
	if (!allElementsRegistered) return

	//#region Calculate initial boundaries
	storyMapState.epics.forEach((epic) => {
		const element = elementRegistry[epic.id]!.container
		const boundingRect = element.getBoundingClientRect()
		const translation = getElementTranslation(element)

		let left = boundingRect.left + storyMapScrollPosition.current - translation[0]
		let right = boundingRect.right + storyMapScrollPosition.current - translation[0]
		let center = avg(left, right)

		boundaries.epic[epic.id] = {left, center, right}
	})

	storyMapState.features.forEach((feature) => {
		const element = elementRegistry[feature.id]!.container
		const boundingRect = element.getBoundingClientRect()
		const translation = getElementTranslation(element)

		let left = boundingRect.left + storyMapScrollPosition.current - translation[0]
		let right = boundingRect.right + storyMapScrollPosition.current - translation[0]
		let center = avg(left, right)

		boundaries.feature[feature.id] = {left, center, right}
	})

	storyMapState.stories.forEach((story) => {
		const element = elementRegistry[story.id]!.container
		const boundingRect = element.getBoundingClientRect()
		const translation = getElementTranslation(element)

		let top = boundingRect.top - translation[1]
		let bottom = boundingRect.bottom - translation[1]
		let center = avg(top, bottom)

		boundaries.story[story.id] = {top, center, bottom}
	})
	//#endregion

	//#region Calculate center positions
	for (const id in boundaries.epic) {
		const epicBoundaries = boundaries.epic[id as Id]!
		const epicMeta = storyMapMeta.current[id as Id]
		if (!epicMeta) continue

		const prevEpicBoundaries = epicMeta.prevItem && boundaries.epic[epicMeta.prevItem]
		const nextEpicBoundaries = epicMeta.nextItem && boundaries.epic[epicMeta.nextItem]

		epicBoundaries.centerWithLeft = prevEpicBoundaries && avg(prevEpicBoundaries.left, epicBoundaries.right)
		epicBoundaries.centerWithRight = nextEpicBoundaries && avg(nextEpicBoundaries.right, epicBoundaries.left)
	}

	for (const id in boundaries.feature) {
		const featureBoundaries = boundaries.feature[id as Id]!
		const featureMeta = storyMapMeta.current[id as Id]
		if (!featureMeta) continue

		const prevFeatureBoundaries = featureMeta.prevItem && boundaries.feature[featureMeta.prevItem]
		const nextFeatureBoundaries = featureMeta.nextItem && boundaries.feature[featureMeta.nextItem]

		featureBoundaries.centerWithLeft = prevFeatureBoundaries && avg(prevFeatureBoundaries.left, featureBoundaries.right)
		featureBoundaries.centerWithRight =
			nextFeatureBoundaries && avg(nextFeatureBoundaries.right, featureBoundaries.left)
	}
	//#endregion

	//#region Collapse gaps between boundaries
	for (const id in boundaries.epic) {
		const epicBoundaries = boundaries.epic[id as Id]!
		const epicMeta = storyMapMeta.current[id as Id]
		if (!epicMeta) continue

		const prevEpicBoundaries = epicMeta.prevItem && boundaries.epic[epicMeta.prevItem]
		const nextEpicBoundaries = epicMeta.nextItem && boundaries.epic[epicMeta.nextItem]

		epicBoundaries.left = prevEpicBoundaries ? prevEpicBoundaries.right : -Infinity
		epicBoundaries.right = nextEpicBoundaries ? avg(epicBoundaries.right, nextEpicBoundaries.left) : Infinity
	}

	for (const id in boundaries.feature) {
		const featureBoundaries = boundaries.feature[id as Id]!
		const featureMeta = storyMapMeta.current[id as Id]
		if (!featureMeta) continue

		const prevFeatureBoundaries = featureMeta.prevItem && boundaries.feature[featureMeta.prevItem]
		const nextFeatureBoundaries = featureMeta.nextItem && boundaries.feature[featureMeta.nextItem]
		const parentEpicBoundaries = boundaries.epic[featureMeta.parent!]
		if (!parentEpicBoundaries) continue

		featureBoundaries.left = prevFeatureBoundaries ? prevFeatureBoundaries.right : parentEpicBoundaries.left
		featureBoundaries.right = nextFeatureBoundaries
			? avg(featureBoundaries.right, nextFeatureBoundaries.left)
			: parentEpicBoundaries.right
	}

	for (const id in boundaries.story) {
		const storyBoundaries = boundaries.story[id as Id]!
		const storyMeta = storyMapMeta.current[id as Id]
		if (!storyMeta) continue

		if (storyMeta.position === 0) storyBoundaries.top = layerBoundaries[1]

		const feature = storyMapState.features.find((feature) => feature.id === storyMeta.parent!)
		if (!feature) continue
		if (storyMeta.position === feature.storyIds.length - 1) storyBoundaries.bottom = Infinity
	}
	//#endregion
}
