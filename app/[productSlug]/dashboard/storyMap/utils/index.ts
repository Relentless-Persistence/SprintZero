import {doc, onSnapshot} from "firebase9/firestore"
import {useSetAtom} from "jotai"
import {useEffect} from "react"

import type {Id} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/Products"

import {storyMapStateAtom} from "../atoms"
import {boundaries, elementRegistry, layerBoundaries, storyMapScrollPosition} from "./globals"
import {db} from "~/config/firebase"
import {Products, ProductSchema} from "~/types/db/Products"
import {useActiveProductId} from "~/utils/useActiveProductId"

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

		let epicLeft = boundingRect.left + storyMapScrollPosition.current - translation[0]
		let epicRight = boundingRect.right + storyMapScrollPosition.current - translation[0]
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

				let featureLeft = boundingRect.left + storyMapScrollPosition.current - translation[0]
				let featureRight = boundingRect.right + storyMapScrollPosition.current - translation[0]
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
