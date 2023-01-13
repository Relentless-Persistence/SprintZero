import produce from "immer"

import type {StoryMapLocation} from "./types"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/Products"

import {
	convertEpicToFeature,
	convertEpicToStory,
	convertFeatureToEpic,
	convertFeatureToStory,
	convertStoryToEpic,
	convertStoryToFeature,
} from "."

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
