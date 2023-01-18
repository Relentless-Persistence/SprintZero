import produce from "immer"

import type {StoryMapItem, StoryMapTarget} from "./types"
import type {Id} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/Products"

import {meta} from "."

export const moveItem = (
	currentState: StoryMapState,
	originalState: StoryMapState,
	startItem: StoryMapItem,
	targetLocation: StoryMapTarget,
	currentVersionId: Id | undefined,
): StoryMapState =>
	produce(currentState, (state) => {
		if (targetLocation === `stay`) return
		if (targetLocation[0] === `before` || targetLocation[0] === `after`) {
			let targetPosition = meta(targetLocation[1].id).position
			targetPosition = targetLocation[0] === `before` ? targetPosition : targetPosition + 1

			if (startItem.type === `epic`) {
				if (targetLocation[1].type === `epic`) {
					// Epic to epic (reordering)

					const epicIndex = state.epics.findIndex((epic) => epic.id === startItem.id)
					const epic = state.epics[epicIndex]!

					// Insert the epic at the new location
					state.epics.splice(targetPosition, 0, epic)

					// Remove the epic from its original location
					state.epics.splice(epicIndex < targetPosition ? epicIndex : epicIndex + 1, 1)
				} else if (targetLocation[1].type === `feature`) {
					// Epic to feature

					if (!currentVersionId) return

					const existingEpic = state.epics.find((epic) => epic.id === startItem.id)!
					const newFeature: Feature = {
						id: existingEpic.id,
						description: existingEpic.description,
						name: existingEpic.name,
						priorityLevel: existingEpic.priorityLevel,
						visibilityLevel: existingEpic.visibilityLevel,
						commentIds: existingEpic.commentIds,
						nameInputStateId: existingEpic.nameInputStateId,
						storyIds: existingEpic.featureIds,
					}

					// Insert the epic as a feature at the new location
					state.features.push(newFeature)
					const host = state.epics.find((epic) => epic.id === meta(targetLocation[1].id).parent)!
					host.featureIds.splice(targetPosition, 0, newFeature.id)

					// Remove the epic from its current location
					state.epics = state.epics.filter((epic) => epic.id !== existingEpic.id)

					// Move child features to stories of the new feature
					const existingFeatures = state.features.filter((feature) => existingEpic.featureIds.includes(feature.id))
					for (const feature of existingFeatures) {
						const story: Story = {
							id: feature.id,
							acceptanceCriteria: [],
							codeLink: null,
							description: feature.description,
							designLink: null,
							name: feature.name,
							points: 0,
							priorityLevel: feature.priorityLevel,
							visibilityLevel: feature.visibilityLevel,
							commentIds: feature.commentIds,
							nameInputStateId: feature.nameInputStateId,
							versionId: currentVersionId,
						}
						state.stories.push(story)
					}
					state.features = state.features.filter((feature) => !existingEpic.featureIds.includes(feature.id))
				} else {
					// Epic to story is not allowed
					return
				}
			} else if (startItem.type === `feature`) {
				if (targetLocation[1].type === `epic`) {
					// Feature to epic

					const existingFeature = state.features.find((feature) => feature.id === startItem.id)!
					const newEpic: Epic = {
						id: existingFeature.id,
						description: existingFeature.description,
						name: existingFeature.name,
						priorityLevel: existingFeature.priorityLevel,
						visibilityLevel: existingFeature.visibilityLevel,
						commentIds: existingFeature.commentIds,
						featureIds: existingFeature.storyIds,
						keeperIds: [],
						nameInputStateId: existingFeature.nameInputStateId,
					}

					// Insert the feature as an epic at the new location
					state.epics.splice(targetPosition, 0, newEpic)

					// Remove the feature from its current location
					state.features = state.features.filter((feature) => feature.id !== existingFeature.id)
					const host = state.epics.find((epic) => epic.id === targetLocation[1].id)!
					host.featureIds = host.featureIds.filter((featureId) => featureId !== existingFeature.id)

					// Move child stories to features of the new epic
					const existingStories = state.stories.filter((story) => existingFeature.storyIds.includes(story.id))
					for (const story of existingStories) {
						const feature: Feature = {
							id: story.id,
							description: story.description,
							name: story.name,
							priorityLevel: story.priorityLevel,
							visibilityLevel: story.visibilityLevel,
							commentIds: story.commentIds,
							nameInputStateId: story.nameInputStateId,
							storyIds: [],
						}
						state.features.push(feature)
					}
					state.stories = state.stories.filter((story) => !existingFeature.storyIds.includes(story.id))
				} else if (targetLocation[1].type === `feature`) {
					const isForeign = meta(startItem.id).parent !== meta(targetLocation[1].id).parent
					if (isForeign) {
						// Feature to feature (reparenting)

						// Insert the feature as a feature at the new location
						const newHost = state.epics.find((epic) => epic.id === meta(targetLocation[1].id).parent)!
						newHost.featureIds.splice(targetPosition, 0, startItem.id)

						// Remove the feature from its current location
						const currentHost = state.epics.find((epic) => epic.id === meta(startItem.id).parent)!
						currentHost.featureIds = currentHost.featureIds.filter((featureId) => featureId !== startItem.id)
					} else {
						// Feature to feature (reordering)

						const startPosition = meta(startItem.id).position
						const host = state.epics.find((epic) => epic.id === meta(startItem.id).parent)!

						// Insert the feature as a feature at the new location
						host.featureIds.splice(targetPosition, 0, startItem.id)

						// Remove the feature from its current location
						host.featureIds.splice(startPosition < targetPosition ? startPosition : startPosition + 1, 1)
					}
				} else {
					// Feature to story

					if (!currentVersionId) return

					const existingFeature = state.features.find((feature) => feature.id === startItem.id)!
					const newStory: Story = {
						id: existingFeature.id,
						acceptanceCriteria: [],
						codeLink: null,
						description: existingFeature.description,
						designLink: null,
						name: existingFeature.name,
						points: 0,
						priorityLevel: existingFeature.priorityLevel,
						visibilityLevel: existingFeature.visibilityLevel,
						commentIds: existingFeature.commentIds,
						nameInputStateId: existingFeature.nameInputStateId,
						versionId: currentVersionId,
					}

					// Insert the feature as a story at the new location
					state.stories.push(newStory)
					const newHost = state.features.find((feature) => feature.id === meta(targetLocation[1].id).parent)!
					newHost.storyIds.splice(targetPosition, 0, startItem.id)

					// Remove the feature from its current location
					const currentHost = state.epics.find((epic) => epic.id === meta(startItem.id).parent)!
					currentHost.featureIds = currentHost.featureIds.filter((featureId) => featureId !== startItem.id)
					state.features = state.features.filter((feature) => feature.id !== existingFeature.id)

					// Delete the original feature's stories
					state.stories = state.stories.filter((story) => !existingFeature.storyIds.includes(story.id))
				}
			} else {
				if (targetLocation[1].type === `epic`) {
					// Story to epic is not allowed
					return
				} else if (targetLocation[1].type === `feature`) {
					// Story to feature

					const existingStory = state.stories.find((story) => story.id === startItem.id)!
					const newFeature: Feature = {
						id: existingStory.id,
						description: existingStory.description,
						name: existingStory.name,
						priorityLevel: existingStory.priorityLevel,
						visibilityLevel: existingStory.visibilityLevel,
						commentIds: existingStory.commentIds,
						nameInputStateId: existingStory.nameInputStateId,
						storyIds: [],
					}

					// Insert the story as a feature at the new location
					state.features.push(newFeature)
					const newHost = state.epics.find((epic) => epic.id === meta(targetLocation[1].id).parent)!
					newHost.featureIds.splice(targetPosition, 0, startItem.id)

					// Remove the story from its current location
					const currentHost = state.features.find((feature) => feature.id === meta(startItem.id).parent)!
					currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
					state.stories = state.stories.filter((story) => story.id !== startItem.id)
				} else {
					const isForeign = meta(startItem.id).parent !== meta(targetLocation[1].id).parent
					if (isForeign) {
						// Story to story (reparenting)

						// Insert the story at the new location
						const host = state.features.find((feature) => feature.id === meta(targetLocation[1].id).parent)!
						host.storyIds.splice(targetPosition, 0, startItem.id)

						// Remove the story from its current location
						const currentHost = state.features.find((feature) => feature.id === meta(startItem.id).parent)!
						currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
					} else {
						// Story to story (reordering)

						const startPosition = meta(startItem.id).position
						const host = state.features.find((feature) => feature.id === meta(startItem.id).parent)!

						// Insert the story at the new location
						host.storyIds.splice(targetPosition, 0, startItem.id)

						// Remove the story from its current location
						host.storyIds.splice(startPosition < targetPosition ? startPosition : startPosition + 1, 1)
					}
				}
			}
		} else {
			if (startItem.type === `epic`) {
				if (targetLocation[1].type === `epic`) {
					// Epic to first feature in epic

					const existingEpic = state.epics.find((epic) => epic.id === startItem.id)!
					const newFeature: Feature = {
						id: existingEpic.id,
						description: existingEpic.description,
						name: existingEpic.name,
						priorityLevel: existingEpic.priorityLevel,
						visibilityLevel: existingEpic.visibilityLevel,
						commentIds: existingEpic.commentIds,
						nameInputStateId: existingEpic.nameInputStateId,
						storyIds: existingEpic.featureIds,
					}

					// Insert the epic as a feature at the new location
					state.features.push(newFeature)
					const host = state.epics.find((epic) => epic.id === targetLocation[1].id)!
					host.featureIds.splice(0, 0, startItem.id)

					// Remove the epic from its current location
					state.epics = state.epics.filter((epic) => epic.id !== startItem.id)
				} else {
					// Epic to story is not allowed
					return
				}
			} else if (startItem.type === `feature`) {
				if (targetLocation[1].type === `epic`) {
					// Feature to another epic as first feature

					// Insert the feature at the new location
					const newHost = state.epics.find((epic) => epic.id === targetLocation[1].id)!
					newHost.featureIds.splice(0, 0, startItem.id)

					// Remove the feature from its current location
					const currentHost = state.epics.find((epic) => epic.id === meta(startItem.id).parent)!
					currentHost.featureIds = currentHost.featureIds.filter((featureId) => featureId !== startItem.id)
				} else if (targetLocation[1].type === `feature`) {
					// Feature to first story of another feature

					if (!currentVersionId) return

					const existingFeature = state.features.find((feature) => feature.id === startItem.id)!
					const newStory: Story = {
						id: existingFeature.id,
						acceptanceCriteria: [],
						codeLink: null,
						description: existingFeature.description,
						designLink: null,
						name: existingFeature.name,
						points: 0,
						priorityLevel: existingFeature.priorityLevel,
						visibilityLevel: existingFeature.visibilityLevel,
						commentIds: existingFeature.commentIds,
						nameInputStateId: existingFeature.nameInputStateId,
						versionId: currentVersionId,
					}

					// Insert the feature as a story at the new location
					state.stories.push(newStory)
					const newHost = state.features.find((feature) => feature.id === targetLocation[1].id)!
					newHost.storyIds.splice(0, 0, startItem.id)

					// Remove the feature from its current location
					const currentHost = state.features.find((feature) => feature.id === meta(startItem.id).parent)!
					currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
					state.features = state.features.filter((feature) => feature.id !== startItem.id)

					// Delete the original feature's stories
					state.stories = state.stories.filter((story) => !existingFeature.storyIds.includes(story.id))
				}
			} else {
				if (targetLocation[1].type === `epic`) {
					// Story to epic is not allowed
					return
				} else if (targetLocation[1].type === `feature`) {
					// Story to first story of another feature

					// Insert the story at the new location
					const newHost = state.features.find((feature) => feature.id === targetLocation[1].id)!
					newHost.storyIds.splice(0, 0, startItem.id)

					// Remove the story from its current location
					const currentHost = state.features.find((feature) => feature.id === meta(startItem.id).parent)!
					currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
				}
			}
		}
	})
