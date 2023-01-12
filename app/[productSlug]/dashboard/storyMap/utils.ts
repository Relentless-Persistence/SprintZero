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

const storyMapTop = 224

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
				right: number
				featureBoundaries: Array<{
					id: Id
					left: number
					right: number
					storyBoundaries: Array<{id: Id; top: number; bottom: number}>
				}>
			}>
		}
		__pointerLocation: {current: [number, number]}
		__pointerOffset: {current: [number, number] | undefined}
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
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__pointerOffset = window.__pointerOffset ?? {current: undefined}
}

export let storyMapScrollPosition = window.__storyMapScrollPosition
export let elementRegistry = window.__elementRegistry
export const layerBoundaries: [number, number] = [62, 140]
export let boundaries = window.__boundaries
export let pointerLocation = window.__pointerLocation
export let pointerOffset = window.__pointerOffset

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

	boundaries.epicBoundaries = storyMapState.epics.map((epic, epicIndex) => {
		const element = elementRegistry.epics[epic.id]!
		const boundingRect = element.getBoundingClientRect()
		const translation = getElementTranslation(element)

		let epicLeft = boundingRect.left + storyMapScrollPosition.position - translation[0]
		if (epicIndex === 0) epicLeft = 0
		let epicRight = boundingRect.right + storyMapScrollPosition.position - translation[0]
		if (epicIndex === storyMapState.epics.length - 1) epicRight = window.innerWidth

		return {
			id: epic.id,
			left: epicLeft,
			right: epicRight,
			featureBoundaries: epic.features.map((feature, featureIndex) => {
				const element = elementRegistry.features[feature.id]!
				const boundingRect = element.getBoundingClientRect()
				const translation = getElementTranslation(element)

				let featureLeft = boundingRect.left + storyMapScrollPosition.position - translation[0]
				if (featureIndex === 0) {
					if (epicIndex === 0) featureLeft = 0
					else featureLeft = epicLeft
				}
				let featureRight = boundingRect.right + storyMapScrollPosition.position - translation[0]
				if (featureIndex === epic.features.length - 1) {
					if (epicIndex === storyMapState.epics.length - 1) featureRight = window.innerWidth
					else featureRight = epicRight
				}

				return {
					id: feature.id,
					left: featureLeft,
					right: featureRight,
					storyBoundaries: feature.stories.map((story, storyIndex) => {
						const element = elementRegistry.stories[story.id]!
						const boundingRect = element.getBoundingClientRect()
						const translation = getElementTranslation(element)

						let top = boundingRect.top - translation[1]
						if (storyIndex === 0) top = layerBoundaries[1] + storyMapTop
						let bottom = boundingRect.bottom - translation[1]
						if (storyIndex === feature.stories.length - 1) bottom = window.innerHeight

						return {id: story.id, top, bottom}
					}),
				}
			}),
		}
	})

	// Collapse gaps between boundaries
	for (const [epicIndex, epicBoundaries] of boundaries.epicBoundaries.entries()) {
		const prevEpicBoundaries = boundaries.epicBoundaries[epicIndex - 1]
		const nextEpicBoundaries = boundaries.epicBoundaries[epicIndex + 1]

		const epicLeft = prevEpicBoundaries?.right ?? epicBoundaries.left
		const epicRight = nextEpicBoundaries ? avg(nextEpicBoundaries.left, epicBoundaries.right) : epicBoundaries.right

		boundaries.epicBoundaries[epicIndex] = {
			...epicBoundaries,
			left: epicLeft,
			right: epicRight,
			featureBoundaries: (() => {
				const allFeatureBoundaries = epicBoundaries.featureBoundaries
				for (const [featureIndex, featureBoundaries] of allFeatureBoundaries.entries()) {
					const prevFeatureBoundaries = epicBoundaries.featureBoundaries[featureIndex - 1]
					const nextFeatureBoundaries = epicBoundaries.featureBoundaries[featureIndex + 1]

					let left = prevFeatureBoundaries?.right ?? featureBoundaries.left
					if (featureIndex === 0) left = epicLeft
					let right = nextFeatureBoundaries
						? avg(nextFeatureBoundaries.left, featureBoundaries.right)
						: featureBoundaries.right
					if (featureIndex === allFeatureBoundaries.length - 1) right = epicRight

					allFeatureBoundaries[featureIndex] = {...featureBoundaries, left, right}
				}
				return allFeatureBoundaries
			})(),
		}
	}
}

export type TargetLocation = {
	epic: number | undefined
	feature: number | undefined
	story: number | undefined
}

export const getTargetLocation = (storyMapState: StoryMapState): TargetLocation => {
	calculateBoundaries(storyMapState)

	const x = pointerLocation.current[0]
	const y = pointerLocation.current[1]

	let hoveringEpicIndex = -1
	let targetEpicIndex = -1
	let hoveringFeatureIndex = -1
	let targetFeatureIndex = -1
	let targetStoryIndex = -1
	for (const [index, epicBoundaries] of boundaries.epicBoundaries.entries()) {
		if (x >= epicBoundaries.left && x < epicBoundaries.right) hoveringEpicIndex = index

		const prevEpicBoundaries = boundaries.epicBoundaries[index - 1]
		const nextEpicBoundaries = boundaries.epicBoundaries[index + 1]
		const centerWithLeft = prevEpicBoundaries && avg(prevEpicBoundaries.left, epicBoundaries.right)
		const centerWithRight = nextEpicBoundaries && avg(epicBoundaries.left, nextEpicBoundaries.right)

		if (centerWithLeft && x >= epicBoundaries.left && x < centerWithLeft) targetEpicIndex = index - 1
		else if (centerWithRight && x >= centerWithRight && x < epicBoundaries.right) targetEpicIndex = index + 1
		else targetEpicIndex = index

		if (hoveringEpicIndex >= 0) {
			const featureBoundaries = epicBoundaries.featureBoundaries
			for (const [index, boundaries] of featureBoundaries.entries()) {
				if (x >= boundaries.left && x < boundaries.right) hoveringFeatureIndex = index

				const prevFeatureBoundaries = featureBoundaries[index - 1]
				const nextFeatureBoundaries = featureBoundaries[index + 1]
				const centerWithLeft = prevFeatureBoundaries && avg(prevFeatureBoundaries.left, boundaries.right)
				const centerWithRight = nextFeatureBoundaries && avg(boundaries.left, nextFeatureBoundaries.right)

				if (centerWithLeft && x >= boundaries.left && x < centerWithLeft) targetFeatureIndex = index - 1
				else if (centerWithRight && x >= centerWithRight && x < boundaries.right) targetFeatureIndex = index + 1
				else targetFeatureIndex = index

				if (hoveringFeatureIndex >= 0) {
					for (const [index, storyBoundaries] of boundaries.storyBoundaries.entries()) {
						if (y >= storyBoundaries.top && y < storyBoundaries.bottom) targetStoryIndex = index

						if (targetStoryIndex >= 0) break
						targetStoryIndex = index + 1
					}

					break
					targetFeatureIndex = index + 1
				}
			}

			break
			targetEpicIndex = index + 1
		}
	}

	console.log({
		epic: y - storyMapTop < layerBoundaries[0] ? targetEpicIndex : hoveringEpicIndex,
		feature:
			y - storyMapTop > layerBoundaries[0]
				? y < layerBoundaries[1]
					? targetFeatureIndex
					: hoveringFeatureIndex
				: undefined,
		story: y - storyMapTop > layerBoundaries[1] ? targetStoryIndex : undefined,
	})

	return {
		epic: y - storyMapTop < layerBoundaries[0] ? targetEpicIndex : hoveringEpicIndex,
		feature:
			y - storyMapTop > layerBoundaries[0]
				? y < layerBoundaries[1]
					? targetFeatureIndex
					: hoveringFeatureIndex
				: undefined,
		story: y - storyMapTop > layerBoundaries[1] ? targetStoryIndex : undefined,
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
		} else if (
			targetLocation.epic !== undefined &&
			targetLocation.feature !== undefined &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0
		) {
			const epicIndex = state.epics.findIndex(({id}) => id === epicId)
			const epic = state.epics[epicIndex]!
			const features = state.epics[targetLocation.epic]!.features

			// Don't allow epic to be moved into itself
			if (epicIndex === targetLocation.epic) return

			// Insert the new feature at feature location
			features.splice(targetLocation.feature, 0, convertEpicToFeature(epic))

			// Remove the epic from its original location
			state.epics.splice(epicIndex, 1)
		} else if (targetLocation.epic !== undefined && targetLocation.epic >= 0) {
			const epicIndex = state.epics.findIndex(({id}) => id === epicId)
			const epic = state.epics[epicIndex]!

			// Insert the epic at new location
			state.epics.splice(targetLocation.epic, 0, epic)

			// Remove the epic from its original location
			state.epics.splice(epicIndex + (epicIndex > targetLocation.epic ? 1 : 0), 1)
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
			targetLocation.story !== undefined &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0 &&
			targetLocation.story >= 0
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
		} else if (
			targetLocation.epic !== undefined &&
			targetLocation.feature !== undefined &&
			targetLocation.epic >= 0 &&
			targetLocation.feature >= 0
		) {
			// Insert the new feature at feature location
			state.epics[targetLocation.epic]!.features.splice(targetLocation.feature, 0, feature)

			// Remove the feature from its original location
			if (targetLocation.epic === epicIndex) {
				state.epics[epicIndex]!.features.splice(featureIndex + (featureIndex > targetLocation.feature ? 1 : 0), 1)
			} else {
				state.epics[epicIndex]!.features.splice(featureIndex, 1)
			}
		} else if (targetLocation.epic !== undefined && targetLocation.epic >= 0) {
			// Insert the feature at new location
			state.epics.splice(targetLocation.epic, 0, convertFeatureToEpic(feature))

			// Remove the feature from its original location
			state.epics[epicIndex]!.features.splice(featureIndex, 1)
		}
	})

export const moveStory = (originalState: StoryMapState, storyId: Id, targetLocation: TargetLocation): StoryMapState =>
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
