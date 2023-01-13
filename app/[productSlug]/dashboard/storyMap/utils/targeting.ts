import type {EpicBoundaries, FeatureBoundaries, StoryBoundaries, StoryMapLocation} from "./types"
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

const getTargetEpic = (
	epicBoundariesList: EpicBoundaries[],
	x: number,
	y: number,
	startLocation: StoryMapLocation,
	hoveringLocation: StoryMapLocation,
): number | undefined => {
	if (hoveringLocation.epic === undefined) return 0

	const isForeign = startLocation.feature !== undefined
	if (isForeign) {
		const boundaries = epicBoundariesList[hoveringLocation.epic]
		if (!boundaries) return undefined

		if (x >= boundaries.left && x < boundaries.center) return hoveringLocation.epic
		else if (x >= boundaries.center && x < boundaries.right) return hoveringLocation.epic + 1
	} else if (startLocation.epic !== undefined) {
		const boundaries = epicBoundariesList[startLocation.epic]
		if (!boundaries) return undefined

		if (boundaries.centerWithLeft && x < boundaries.centerWithLeft) return startLocation.epic - 1
		else if (boundaries.centerWithRight && x >= boundaries.centerWithRight) return startLocation.epic + 1
		else return startLocation.epic
	}
}

const getTargetFeature = (
	featureBoundariesList: FeatureBoundaries[],
	x: number,
	startLocation: StoryMapLocation,
	hoveringLocation: StoryMapLocation,
): number | undefined => {
	if (hoveringLocation.feature === undefined) return 0

	const isForeign =
		startLocation.feature === undefined || // Was originally an epic
		startLocation.epic !== hoveringLocation.epic || // Was originally a feature, but from a different epic
		startLocation.story !== undefined // Was originally a story
	if (isForeign) {
		const boundaries = featureBoundariesList[hoveringLocation.feature]
		if (!boundaries) return undefined

		if (x >= boundaries.left && x < boundaries.center) return hoveringLocation.feature
		else if (x >= boundaries.center && x < boundaries.right) return hoveringLocation.feature + 1
	} else if (startLocation.feature !== undefined) {
		const boundaries = featureBoundariesList[startLocation.feature]
		if (!boundaries) return undefined

		if (boundaries.centerWithLeft && x < boundaries.centerWithLeft) return startLocation.feature - 1
		else if (boundaries.centerWithRight && x >= boundaries.centerWithRight) return startLocation.feature + 1
		else return startLocation.feature
	}
}

const getTargetStory = (
	storyBoundariesList: StoryBoundaries[],
	x: number,
	y: number,
	startLocation: StoryMapLocation,
	hoveringLocation: StoryMapLocation,
): number | undefined => {
	if (hoveringLocation.story === undefined) return 0

	const boundaries = storyBoundariesList[hoveringLocation.story]
	if (!boundaries) return undefined
	if (y >= boundaries.top && y < boundaries.center) return hoveringLocation.story
	else if (y >= boundaries.center && y < boundaries.bottom) return hoveringLocation.story + 1
}

export const getTargetLocation = (storyMapState: StoryMapState, startLocation: StoryMapLocation): StoryMapLocation => {
	calculateBoundaries(storyMapState)

	const x = pointerLocation.current[0] + storyMapScrollPosition.current
	const y = pointerLocation.current[1]

	const hoveringLocation = getHoveringLocation()
	const featureBoundariesList =
		hoveringLocation.epic !== undefined
			? boundaries.epicBoundaries[hoveringLocation.epic]?.featureBoundaries
			: undefined
	const storyBoundaries =
		hoveringLocation.epic !== undefined && hoveringLocation.feature !== undefined
			? boundaries.epicBoundaries[hoveringLocation.epic]?.featureBoundaries[hoveringLocation.feature]?.storyBoundaries
			: undefined

	let targetEpicIndex = getTargetEpic(boundaries.epicBoundaries, x, y, startLocation, hoveringLocation)
	if (y >= layerBoundaries[0]) targetEpicIndex = hoveringLocation.epic

	let targetFeatureIndex = featureBoundariesList
		? getTargetFeature(featureBoundariesList, x, startLocation, hoveringLocation)
		: undefined
	if (y < layerBoundaries[0]) targetFeatureIndex = undefined
	if (y >= layerBoundaries[1]) {
		if (hoveringLocation.epic && storyMapState.epics[hoveringLocation.epic]!.features.length === 0)
			targetFeatureIndex = 0
		else targetFeatureIndex = hoveringLocation.feature
	}

	let targetStoryIndex = storyBoundaries
		? getTargetStory(storyBoundaries, x, y, startLocation, hoveringLocation)
		: undefined
	if (y < layerBoundaries[1]) targetStoryIndex = undefined

	const targetLocation = {
		epic: targetEpicIndex,
		feature: targetFeatureIndex,
		story: targetStoryIndex,
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

export const getHoveringLocation = (): StoryMapLocation => {
	const x = pointerLocation.current[0] + storyMapScrollPosition.current
	const y = pointerLocation.current[1]

	let hoveringEpicIndex: number | undefined = boundaries.epicBoundaries.findIndex(
		({left, right}) => x >= left && x < right,
	)
	if (hoveringEpicIndex === -1) hoveringEpicIndex = undefined

	let hoveringFeatureIndex =
		hoveringEpicIndex === undefined
			? undefined
			: boundaries.epicBoundaries[hoveringEpicIndex]?.featureBoundaries.findIndex(
					({left, right}) => x >= left && x < right,
			  )
	if (hoveringFeatureIndex === -1) hoveringFeatureIndex = undefined

	let hoveringStoryIndex =
		hoveringEpicIndex === undefined || hoveringFeatureIndex === undefined
			? undefined
			: boundaries.epicBoundaries[hoveringEpicIndex]?.featureBoundaries[
					hoveringFeatureIndex
			  ]?.storyBoundaries.findIndex(({top, bottom}) => y >= top && y < bottom)
	if (hoveringStoryIndex === -1) hoveringStoryIndex = undefined

	return {
		epic: hoveringEpicIndex,
		feature: y > layerBoundaries[0] ? hoveringFeatureIndex : undefined,
		story: hoveringStoryIndex,
	}
}
