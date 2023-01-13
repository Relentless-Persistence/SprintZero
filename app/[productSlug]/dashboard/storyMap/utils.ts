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

declare global {
	interface Window {
		__storyMapScrollPosition: {position: number}
		__elementRegistry: {
			epics: Record<Id, HTMLElement | undefined>
			features: Record<Id, HTMLElement | undefined>
			stories: Record<Id, HTMLElement | undefined>
		}
		__boundaries: {
			epicBoundaries: Array<{
				id: Id
				left: number
				center: number
				right: number
				centerWithLeft?: number
				centerWithRight?: number
				featureBoundaries: Array<{
					id: Id
					left: number
					center: number
					right: number
					centerWithLeft?: number
					centerWithRight?: number
					storyBoundaries: Array<{id: Id; top: number; center: number; bottom: number}>
				}>
			}>
		}
		__pointerLocation: {current: [number, number]}
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
	window.__boundaries = window.__boundaries ?? {epicBoundaries: []}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__pointerLocation = window.__pointerLocation ?? {current: [0, 0]}
}

export const storyMapTop = 224
export const layerBoundaries: [number, number] = [62 + storyMapTop, 156 + storyMapTop]
export let storyMapScrollPosition = window.__storyMapScrollPosition
export let elementRegistry = window.__elementRegistry
export let boundaries = window.__boundaries
export let pointerLocation = window.__pointerLocation

export const avg = (...arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

export const useSubscribeToData = (): void => {
	const activeProduct = useActiveProductId()
	const setStoryMapState = useSetAtom(storyMapStateAtom)

	useEffect(() => {
		if (activeProduct === undefined) return

		return onSnapshot(doc(db, Products._, activeProduct), (doc) => {
			const data = ProductSchema.parse({id: doc.id, ...doc.data()})
			setStoryMapState(data.storyMapState)
		})
	}, [activeProduct, setStoryMapState])
}

const getElementTranslation = (element: HTMLElement): [number, number] => {
	const style = window.getComputedStyle(element)
	const matrix = new DOMMatrix(style.transform)
	return [matrix.m41, matrix.m42]
}

export const calculateBoundaries = (storyMapState: StoryMapState): void => {
	// Make sure all story map items have registered their DOM elements in elementRegistry
	const allEpicsRegistered = storyMapState.epics.every((epic) => elementRegistry.epics[epic.id])
	const allFeaturesRegistered = storyMapState.epics
		.flatMap((epic) => epic.features)
		.every((feature) => elementRegistry.features[feature.id])
	const allStoriesRegistered = storyMapState.epics
		.flatMap((epic) => epic.features)
		.flatMap((feature) => feature.stories)
		.every((story) => elementRegistry.stories[story.id])
	if (!allEpicsRegistered || !allFeaturesRegistered || !allStoriesRegistered) return

	// Calculate initial boundaries
	boundaries.epicBoundaries = storyMapState.epics.map((epic) => {
		const element = elementRegistry.epics[epic.id]!
		const boundingRect = element.getBoundingClientRect()
		const translation = getElementTranslation(element)

		let epicLeft = boundingRect.left + storyMapScrollPosition.position - translation[0]
		let epicRight = boundingRect.right + storyMapScrollPosition.position - translation[0]
		let epicCenter = avg(epicLeft, epicRight)

		return {
			id: epic.id,
			left: epicLeft,
			center: epicCenter,
			right: epicRight,
			featureBoundaries: epic.features.map((feature) => {
				const element = elementRegistry.features[feature.id]!
				const boundingRect = element.getBoundingClientRect()
				const translation = getElementTranslation(element)

				let featureLeft = boundingRect.left + storyMapScrollPosition.position - translation[0]
				let featureRight = boundingRect.right + storyMapScrollPosition.position - translation[0]
				let featureCenter = avg(featureLeft, featureRight)

				return {
					id: feature.id,
					left: featureLeft,
					center: featureCenter,
					right: featureRight,
					storyBoundaries: feature.stories.map((story, storyIndex) => {
						const element = elementRegistry.stories[story.id]!
						const boundingRect = element.getBoundingClientRect()
						const translation = getElementTranslation(element)

						let top = boundingRect.top - translation[1]
						let bottom = boundingRect.bottom - translation[1]
						const center = avg(top, bottom)
						if (storyIndex === 0) top = layerBoundaries[1]
						if (storyIndex === feature.stories.length - 1) bottom = Infinity

						return {id: story.id, top, center, bottom}
					}),
				}
			}),
		}
	})

	// Calculate center positions
	boundaries.epicBoundaries = boundaries.epicBoundaries.map((epicBoundaries, epicIndex) => {
		const prevEpicBoundaries = boundaries.epicBoundaries[epicIndex - 1]
		const nextEpicBoundaries = boundaries.epicBoundaries[epicIndex + 1]

		return {
			...epicBoundaries,
			centerWithLeft: prevEpicBoundaries && avg(prevEpicBoundaries.left, epicBoundaries.right),
			centerWithRight: nextEpicBoundaries && avg(nextEpicBoundaries.right, epicBoundaries.left),
			featureBoundaries: epicBoundaries.featureBoundaries.map((featureBoundaries, featureIndex) => {
				const prevFeatureBoundaries = epicBoundaries.featureBoundaries[featureIndex - 1]
				const nextFeatureBoundaries = epicBoundaries.featureBoundaries[featureIndex + 1]

				return {
					...featureBoundaries,
					centerWithLeft: prevFeatureBoundaries && avg(prevFeatureBoundaries.left, featureBoundaries.right),
					centerWithRight: nextFeatureBoundaries && avg(nextFeatureBoundaries.right, featureBoundaries.left),
				}
			}),
		}
	})

	// Collapse gaps between boundaries
	for (const [epicIndex, epicBoundaries] of boundaries.epicBoundaries.entries()) {
		const prevEpicBoundaries = boundaries.epicBoundaries[epicIndex - 1]
		const nextEpicBoundaries = boundaries.epicBoundaries[epicIndex + 1]

		let epicLeft = prevEpicBoundaries?.right ?? epicBoundaries.left
		let epicRight = nextEpicBoundaries ? avg(nextEpicBoundaries.left, epicBoundaries.right) : epicBoundaries.right
		if (epicIndex === 0) epicLeft = -Infinity
		if (epicIndex === storyMapState.epics.length - 1) epicRight = Infinity

		boundaries.epicBoundaries[epicIndex] = {
			...epicBoundaries,
			left: epicLeft,
			right: epicRight,
			featureBoundaries: (() => {
				const allFeatureBoundaries = epicBoundaries.featureBoundaries
				for (const [featureIndex, featureBoundaries] of allFeatureBoundaries.entries()) {
					const prevFeatureBoundaries = epicBoundaries.featureBoundaries[featureIndex - 1]
					const nextFeatureBoundaries = epicBoundaries.featureBoundaries[featureIndex + 1]

					let featureLeft = prevFeatureBoundaries?.right ?? featureBoundaries.left
					let featureRight = nextFeatureBoundaries
						? avg(nextFeatureBoundaries.left, featureBoundaries.right)
						: featureBoundaries.right
					if (featureIndex === 0) {
						if (epicIndex === 0) featureLeft = -Infinity
						else featureLeft = epicLeft
					}
					if (featureIndex === allFeatureBoundaries.length - 1) {
						if (epicIndex === storyMapState.epics.length - 1) featureRight = Infinity
						else featureRight = epicRight
					}

					allFeatureBoundaries[featureIndex] = {...featureBoundaries, left: featureLeft, right: featureRight}
				}
				return allFeatureBoundaries
			})(),
		}
	}
}

export type StoryMapLocation = {
	epic?: number
	feature?: number
	story?: number
}

export const getEpicLocation = (storyMapState: StoryMapState, epicId: Id): StoryMapLocation => {
	const epicIndex = storyMapState.epics.findIndex((epic) => epic.id === epicId)
	if (epicIndex === -1) return {}
	return {epic: epicIndex}
}

export const getFeatureLocation = (storyMapState: StoryMapState, featureId: Id): StoryMapLocation => {
	for (const [epicIndex, epic] of storyMapState.epics.entries()) {
		const featureIndex = epic.features.findIndex((feature) => feature.id === featureId)
		if (featureIndex !== -1) return {epic: epicIndex, feature: featureIndex}
	}
	return {}
}

export const getStoryLocation = (storyMapState: StoryMapState, storyId: Id): StoryMapLocation => {
	for (const [epicIndex, epic] of storyMapState.epics.entries()) {
		for (const [featureIndex, feature] of epic.features.entries()) {
			const storyIndex = feature.stories.findIndex((story) => story.id === storyId)
			if (storyIndex !== -1) return {epic: epicIndex, feature: featureIndex, story: storyIndex}
		}
	}
	return {}
}

const getTargetStory = (
	storyBoundaries: (typeof boundaries)[`epicBoundaries`][number][`featureBoundaries`][number][`storyBoundaries`],
	y: number,
	startLocation: StoryMapLocation | undefined,
	featureIndex: number,
): {hoveringStoryIndex: number | undefined; targetStoryIndex: number | undefined} => {
	let hoveringStoryIndex: number | undefined = undefined
	let targetStoryIndex: number | undefined = undefined

	for (const [storyIndex, {top, center, bottom}] of storyBoundaries.entries()) {
		if (y < top) continue

		hoveringStoryIndex = storyIndex

		if (startLocation) {
			const isForeign = startLocation.story === undefined || startLocation.feature !== featureIndex
			if (isForeign) {
				if (y >= top && y < center) targetStoryIndex = storyIndex
				else if (y >= center && y < bottom) targetStoryIndex = storyIndex + 1
			} else {
				if (y >= top && y < bottom) targetStoryIndex = storyIndex
			}
		}

		break
	}
	if (targetStoryIndex === undefined) targetStoryIndex = storyBoundaries.length

	return {hoveringStoryIndex, targetStoryIndex}
}

const getTargetFeature = (
	featureBoundaries: (typeof boundaries)[`epicBoundaries`][number][`featureBoundaries`],
	x: number,
	y: number,
	startLocation: StoryMapLocation | undefined,
	epicIndex: number,
): {
	hoveringFeatureIndex: number | undefined
	targetFeatureIndex: number | undefined
	hoveringStoryIndex: number | undefined
	targetStoryIndex: number | undefined
} => {
	let hoveringFeatureIndex: number | undefined = undefined
	let targetFeatureIndex: number | undefined = undefined
	let hoveringStoryIndex: number | undefined = undefined
	let targetStoryIndex: number | undefined = undefined

	for (const [
		featureIndex,
		{left, center, right, centerWithLeft, centerWithRight, storyBoundaries},
	] of featureBoundaries.entries()) {
		if (x < left || x >= right) continue

		hoveringFeatureIndex = featureIndex

		if (startLocation) {
			const isForeign =
				startLocation.feature === undefined || // Was originally an epic
				(startLocation.story === undefined && startLocation.epic !== epicIndex) || // Was originally a feature, but from a different epic
				startLocation.story !== undefined // Was originally a story
			if (isForeign) {
				if (x >= left && x < center) targetFeatureIndex = featureIndex
				else if (x >= center && x < right) targetFeatureIndex = featureIndex + 1
			} else {
				if (centerWithLeft && x >= left && x < centerWithLeft) targetFeatureIndex = featureIndex - 1
				else if (centerWithRight && x >= centerWithRight && x < right) targetFeatureIndex = featureIndex + 1
				else targetFeatureIndex = featureIndex
			}
		}

		;({hoveringStoryIndex, targetStoryIndex} = getTargetStory(storyBoundaries, y, startLocation, featureIndex))
		break
	}
	if (targetFeatureIndex === undefined) targetFeatureIndex = featureBoundaries.length

	return {hoveringFeatureIndex, targetFeatureIndex, hoveringStoryIndex, targetStoryIndex}
}

const getTargetEpic = (
	x: number,
	y: number,
	startLocation: StoryMapLocation | undefined,
): {
	hoveringEpicIndex: number | undefined
	targetEpicIndex: number | undefined
	hoveringFeatureIndex: number | undefined
	targetFeatureIndex: number | undefined
	hoveringStoryIndex: number | undefined
	targetStoryIndex: number | undefined
} => {
	let hoveringEpicIndex: number | undefined = undefined
	let targetEpicIndex: number | undefined = undefined
	let hoveringFeatureIndex: number | undefined = undefined
	let targetFeatureIndex: number | undefined = undefined
	let hoveringStoryIndex: number | undefined = undefined
	let targetStoryIndex: number | undefined = undefined
	for (const [
		index,
		{left, center, right, centerWithLeft, centerWithRight, featureBoundaries},
	] of boundaries.epicBoundaries.entries()) {
		if (x < left || x >= right) continue

		hoveringEpicIndex = index

		if (startLocation) {
			const isForeign = startLocation.feature !== undefined
			if (isForeign) {
				if (x >= left && x < center) targetEpicIndex = index
				else if (x >= center && x < right) targetEpicIndex = index + 1
			} else {
				if (centerWithLeft && x < centerWithLeft) targetEpicIndex = index - 1
				else if (centerWithRight && x >= centerWithRight) targetEpicIndex = index + 1
				else targetEpicIndex = index
			}
			console.log(targetEpicIndex, index, centerWithLeft)
		}

		;({hoveringFeatureIndex, targetFeatureIndex, hoveringStoryIndex, targetStoryIndex} = getTargetFeature(
			featureBoundaries,
			x,
			y,
			startLocation,
			index,
		))

		break
	}
	if (targetEpicIndex === undefined) targetEpicIndex = boundaries.epicBoundaries.length

	return {
		hoveringEpicIndex,
		targetEpicIndex,
		hoveringFeatureIndex,
		targetFeatureIndex,
		hoveringStoryIndex,
		targetStoryIndex,
	}
}

export const getTargetLocation = (storyMapState: StoryMapState, startLocation?: StoryMapLocation): StoryMapLocation => {
	calculateBoundaries(storyMapState)

	const x = pointerLocation.current[0] + storyMapScrollPosition.position
	const y = pointerLocation.current[1]

	const {
		hoveringEpicIndex,
		targetEpicIndex,
		hoveringFeatureIndex,
		targetFeatureIndex,
		hoveringStoryIndex,
		targetStoryIndex,
	} = getTargetEpic(x, y, startLocation)

	if (!startLocation)
		return {
			epic: hoveringEpicIndex,
			feature: y > layerBoundaries[0] ? hoveringFeatureIndex : undefined,
			story: hoveringStoryIndex,
		}

	const targetLocation = {
		epic: y < layerBoundaries[0] ? targetEpicIndex : hoveringEpicIndex,
		feature: y > layerBoundaries[0] ? (y < layerBoundaries[1] ? targetFeatureIndex : hoveringFeatureIndex) : undefined,
		story: y > layerBoundaries[1] ? targetStoryIndex : undefined,
	}

	// Don't allow epic to move into itself
	if (
		startLocation.epic === targetLocation.epic &&
		startLocation.feature === undefined &&
		targetLocation.feature !== undefined
	)
		return startLocation
	// Don't allow feature to move into itself
	if (
		startLocation.feature === targetLocation.feature &&
		startLocation.story === undefined &&
		targetLocation.story !== undefined
	)
		return startLocation

	return targetLocation
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
	targetLocation: StoryMapLocation,
	currentVersionId: Id | `__ALL_VERSIONS__`,
): StoryMapState =>
	produce(originalState, (state) => {
		if (
			targetLocation.epic !== undefined &&
			targetLocation.feature !== undefined &&
			targetLocation.story !== undefined
		) {
			const epicIndex = state.epics.findIndex(({id}) => id === epicId)
			const epic = state.epics[epicIndex]!

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
			const storiesOrder = state.epics[targetLocation.epic]!.features[targetLocation.feature]!.stories
			storiesOrder.splice(targetLocation.story, 0, convertEpicToStory(epic, currentVersionId))

			// Remove the epic from its original location
			state.epics.splice(epicIndex, 1)
		} else if (targetLocation.epic !== undefined && targetLocation.feature !== undefined) {
			const epicIndex = state.epics.findIndex(({id}) => id === epicId)
			const epic = state.epics[epicIndex]!
			const features = state.epics[targetLocation.epic]!.features

			// Don't allow epic to be moved into itself
			if (epicIndex === targetLocation.epic) return

			// Insert the new feature at feature location
			features.splice(targetLocation.feature, 0, convertEpicToFeature(epic))

			// Remove the epic from its original location
			state.epics.splice(epicIndex, 1)
		} else if (targetLocation.epic !== undefined) {
			const epicIndex = state.epics.findIndex(({id}) => id === epicId)
			const epic = state.epics[epicIndex]!

			// Insert the epic at new location
			state.epics.splice(targetLocation.epic + (targetLocation.epic > epicIndex ? 1 : 0), 0, epic)

			// Remove the epic from its original location
			state.epics.splice(epicIndex + (epicIndex > targetLocation.epic ? 1 : 0), 1)
		}
	})

export const moveFeature = (
	originalState: StoryMapState,
	featureId: Id,
	targetLocation: StoryMapLocation,
	currentVersionId: Id | `__ALL_VERSIONS__`,
): StoryMapState =>
	produce(originalState, (state) => {
		let epicIndex = -1
		let featureIndex = -1
		epicLoop: for (const [i, epic] of state.epics.entries()) {
			for (const [j, feature] of epic.features.entries()) {
				if (feature.id === featureId) {
					epicIndex = i
					featureIndex = j
					break epicLoop
				}
			}
		}
		const feature = state.epics[epicIndex]!.features[featureIndex]!

		if (
			targetLocation.epic !== undefined &&
			targetLocation.feature !== undefined &&
			targetLocation.story !== undefined
		) {
			const stories = state.epics[targetLocation.epic]!.features[targetLocation.feature]!.stories

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
			state.epics[epicIndex]!.features.splice(featureIndex, 1)
		} else if (targetLocation.epic !== undefined && targetLocation.feature !== undefined) {
			if (targetLocation.epic === epicIndex) {
				// Insert the new feature at feature location
				state.epics[targetLocation.epic]!.features.splice(
					targetLocation.feature + (targetLocation.feature > featureIndex ? 1 : 0),
					0,
					feature,
				)

				// Remove the feature from its original location
				state.epics[epicIndex]!.features.splice(featureIndex + (featureIndex > targetLocation.feature ? 1 : 0), 1)
			} else {
				// Insert the new feature at feature location
				state.epics[targetLocation.epic]!.features.splice(targetLocation.feature, 0, feature)
				// Remove the feature from its original location
				state.epics[epicIndex]!.features.splice(featureIndex, 1)
			}
		} else if (targetLocation.epic !== undefined) {
			// Insert the feature at new location
			state.epics.splice(targetLocation.epic, 0, convertFeatureToEpic(feature))

			// Remove the feature from its original location
			state.epics[epicIndex]!.features.splice(featureIndex, 1)
		}
	})

export const moveStory = (originalState: StoryMapState, storyId: Id, targetLocation: StoryMapLocation): StoryMapState =>
	produce(originalState, (state) => {
		let epicIndex = -1
		let featureIndex = -1
		let storyIndex = -1
		epicLoop: for (const [i, epic] of state.epics.entries()) {
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
		const story = state.epics[epicIndex]!.features[featureIndex]!.stories[storyIndex]!

		if (
			targetLocation.epic !== undefined &&
			targetLocation.feature !== undefined &&
			targetLocation.story !== undefined &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0 &&
			targetLocation.story >= 0
		) {
			const stories = state.epics[targetLocation.epic]!.features[targetLocation.feature]!.stories

			// Insert the story at story location
			stories.splice(targetLocation.story, 0, story)

			// Remove the story from its original location
			if (targetLocation.epic === epicIndex && targetLocation.feature === featureIndex) {
				stories.splice(storyIndex + (storyIndex > targetLocation.story ? 1 : 0), 1)
			} else {
				stories.splice(storyIndex, 1)
			}
		} else if (
			targetLocation.epic !== undefined &&
			targetLocation.feature !== undefined &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0
		) {
			// Insert the new story at feature location
			state.epics[targetLocation.epic]!.features.splice(targetLocation.feature, 0, convertStoryToFeature(story))

			// Remove the story from its original location
			state.epics[epicIndex]!.features[featureIndex]!.stories.splice(storyIndex, 1)
		} else if (targetLocation.epic !== undefined && targetLocation.epic >= 0) {
			// Insert the story at new location
			state.epics.splice(targetLocation.epic, 0, convertStoryToEpic(story))

			// Remove the story from its original location
			state.epics[epicIndex]!.features[featureIndex]!.stories.splice(storyIndex, 1)
		}
	})
