import type {StoryMapLocation} from "./types"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/Products"

import {calculateBoundaries} from "."
import {boundaries, layerBoundaries, pointerLocation, storyMapScrollPosition} from "./globals"

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

	const x = pointerLocation.current[0] + storyMapScrollPosition.current
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
