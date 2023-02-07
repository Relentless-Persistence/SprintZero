import {Timestamp} from "firebase/firestore"
import produce from "immer"

import type {StoryMapItem, StoryMapTarget} from "./types"
import type {WithDocumentData} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"

import {avg, meta, sortEpics, sortFeatures} from "."

export const moveItem = (
	currentState: WithDocumentData<StoryMapState>,
	originalState: WithDocumentData<StoryMapState>,
	startItem: StoryMapItem,
	targetLocation: StoryMapTarget,
	currentVersion: string | undefined,
): WithDocumentData<StoryMapState> =>
	produce(currentState, (draft) => {
		if (targetLocation === `stay`) return
		if (targetLocation[0] === `before` || targetLocation[0] === `after`) {
			let targetPosition = meta(targetLocation[1].id).position
			targetPosition = targetLocation[0] === `before` ? targetPosition : targetPosition + 1

			if (startItem.type === `epic`) {
				if (targetLocation[1].type === `epic`) {
					// Epic to epic (reordering)

					const startPosition = draft.epics.findIndex((epic) => epic.id === startItem.id)!
					let newUserValue: number
					if (startPosition < targetPosition) {
						const epicBefore = draft.epics.find((epic, i) => i === targetPosition - 1)
						const epicAfter = draft.epics.find((epic, i) => i === targetPosition)
						newUserValue = avg(epicBefore?.userValue ?? 0, epicAfter?.userValue ?? 1)
					} else {
						const epicBefore = draft.epics.find((epic, i) => i === targetPosition - 2)
						const epicAfter = draft.epics.find((epic, i) => i === targetPosition - 1)
						newUserValue = avg(epicBefore?.userValue ?? 0, epicAfter?.userValue ?? 1)
					}

					draft.epics[startPosition]!.userValue = newUserValue
					draft.epics = sortEpics(draft.epics)
				} else if (targetLocation[1].type === `feature`) {
					// Epic to feature

					if (!currentVersion) return

					const featureBefore = draft.features.find((feature, i) => i === targetPosition - 1)
					const featureAfter = draft.features.find((feature, i) => i === targetPosition)
					const newUserValue = avg(featureBefore?.userValue ?? 0, featureAfter?.userValue ?? 1)

					const existingEpic = draft.epics.find((epic) => epic.id === startItem.id)!
					const newFeature: Feature = {
						id: existingEpic.id,
						description: existingEpic.description,
						effort: 0.5,
						name: existingEpic.name,
						userValue: newUserValue,
						storyIds: existingEpic.featureIds,
					}

					// Insert the epic as a feature at the new location
					draft.features.push(newFeature)
					const host = draft.epics.find((epic) => epic.id === meta(targetLocation[1].id).parent)!
					host.featureIds.splice(targetPosition, 0, newFeature.id)

					// Remove the epic from its current location
					draft.epics = draft.epics.filter((epic) => epic.id !== existingEpic.id)

					// Move child features to stories of the new feature
					const existingFeatures = draft.features.filter((feature) => existingEpic.featureIds.includes(feature.id))
					for (const feature of existingFeatures) {
						const story: Story = {
							id: feature.id,
							acceptanceCriteria: [],
							branchName: null,
							createdAt: Timestamp.now(),
							description: feature.description,
							designLink: null,
							ethicsApproved: null,
							ethicsColumn: null,
							ethicsVotes: [],
							name: feature.name,
							pageLink: null,
							points: 0,
							sprintColumn: `productBacklog`,
							versionId: currentVersion,
						}
						draft.stories.push(story)
					}
					draft.features = draft.features.filter((feature) => !existingEpic.featureIds.includes(feature.id))
				} else {
					// Epic to story is not allowed
					return
				}
			} else if (startItem.type === `feature`) {
				if (targetLocation[1].type === `epic`) {
					// Feature to epic

					const epicBefore = draft.epics.find((epic, i) => i === targetPosition - 1)
					const epicAfter = draft.epics.find((epic, i) => i === targetPosition)
					const newUserValue = avg(epicBefore?.userValue ?? 0, epicAfter?.userValue ?? 1)

					const existingFeature = draft.features.find((feature) => feature.id === startItem.id)!
					const newEpic: Epic = {
						id: existingFeature.id,
						description: existingFeature.description,
						effort: 0.5,
						name: existingFeature.name,
						userValue: newUserValue,
						featureIds: existingFeature.storyIds,
						keeperIds: [],
					}

					// Insert the feature as an epic at the new location
					draft.epics.splice(targetPosition, 0, newEpic)

					// Remove the feature from its current location
					draft.features = draft.features.filter((feature) => feature.id !== existingFeature.id)
					const host = draft.epics.find((epic) => epic.id === targetLocation[1].id)!
					host.featureIds = host.featureIds.filter((featureId) => featureId !== existingFeature.id)

					// Move child stories to features of the new epic
					const existingStories = draft.stories.filter((story) => existingFeature.storyIds.includes(story.id))
					for (const story of existingStories) {
						const feature: Feature = {
							id: story.id,
							description: story.description,
							effort: 0.5,
							name: story.name,
							userValue: 0.5,
							storyIds: [],
						}
						draft.features.push(feature)
					}
					draft.stories = draft.stories.filter((story) => !existingFeature.storyIds.includes(story.id))
				} else if (targetLocation[1].type === `feature`) {
					const isForeign = meta(startItem.id).parent !== meta(targetLocation[1].id).parent
					if (isForeign) {
						// Feature to feature (reparenting)

						const newHost = draft.epics.find((epic) => epic.id === meta(targetLocation[1].id).parent)!

						// Update the feature's userValue
						const prevFeatureId = newHost.featureIds[targetPosition - 1]
						const nextFeatureId = newHost.featureIds[targetPosition]
						const prevFeatureUserValue = prevFeatureId
							? draft.features.find((feature) => feature.id === prevFeatureId)!.userValue
							: 0
						const nextFeatureUserValue = nextFeatureId
							? draft.features.find((feature) => feature.id === nextFeatureId)!.userValue
							: 1
						const newFeatureUserValue = (prevFeatureUserValue + nextFeatureUserValue) / 2
						const existingFeature = draft.features.find((feature) => feature.id === startItem.id)!
						existingFeature.userValue = newFeatureUserValue

						// Insert the feature as a feature at the new location
						newHost.featureIds.push(startItem.id)
						newHost.featureIds = sortFeatures(draft as StoryMapState, newHost.featureIds)

						// Remove the feature from its current location
						const currentHost = draft.epics.find((epic) => epic.id === meta(startItem.id).parent)!
						currentHost.featureIds = currentHost.featureIds.filter((featureId) => featureId !== startItem.id)
					} else {
						// Feature to feature (reordering)

						const startPosition = meta(startItem.id).position
						let newUserValue: number
						if (startPosition < targetPosition) {
							const targetFeature = draft.features.find((feature) => feature.id === targetLocation[1].id)!
							const targetFeaturePlusOne = draft.features.find(
								(feature) => feature.id === meta(targetLocation[1].id).nextItem,
							)
							const userValue1 = targetFeature.userValue
							const userValue2 = targetFeaturePlusOne ? targetFeaturePlusOne.userValue : 1
							newUserValue = (userValue1 + userValue2) / 2
						} else {
							const targetFeature = draft.features.find((feature) => feature.id === targetLocation[1].id)!
							const targetFeatureMinusOne = draft.features.find(
								(feature) => feature.id === meta(targetLocation[1].id).prevItem,
							)
							const userValue1 = targetFeature.userValue
							const userValue2 = targetFeatureMinusOne ? targetFeatureMinusOne.userValue : 0
							newUserValue = (userValue1 + userValue2) / 2
						}

						draft.features.find((feature) => feature.id === startItem.id)!.userValue = newUserValue
						const host = draft.epics.find((epic) => epic.id === meta(startItem.id).parent)!
						host.featureIds = sortFeatures(draft as StoryMapState, host.featureIds)
					}
				} else {
					// Feature to story

					if (!currentVersion) return

					const existingFeature = draft.features.find((feature) => feature.id === startItem.id)!
					const newStory: Story = {
						id: existingFeature.id,
						acceptanceCriteria: [],
						branchName: null,
						createdAt: Timestamp.now(),
						description: existingFeature.description,
						designLink: null,
						ethicsApproved: null,
						ethicsColumn: null,
						ethicsVotes: [],
						name: existingFeature.name,
						pageLink: null,
						points: 0,
						sprintColumn: `productBacklog`,
						versionId: currentVersion,
					}

					// Insert the feature as a story at the new location
					draft.stories.push(newStory)
					const newHost = draft.features.find((feature) => feature.id === meta(targetLocation[1].id).parent)!
					newHost.storyIds.splice(targetPosition, 0, startItem.id)

					// Remove the feature from its current location
					const currentHost = draft.epics.find((epic) => epic.id === meta(startItem.id).parent)!
					currentHost.featureIds = currentHost.featureIds.filter((featureId) => featureId !== startItem.id)
					draft.features = draft.features.filter((feature) => feature.id !== existingFeature.id)

					// Delete the original feature's stories
					draft.stories = draft.stories.filter((story) => !existingFeature.storyIds.includes(story.id))
				}
			} else {
				if (targetLocation[1].type === `epic`) {
					// Story to epic is not allowed
					return
				} else if (targetLocation[1].type === `feature`) {
					// Story to feature

					const featureBefore = draft.features.find((feature, i) => i === targetPosition - 1)
					const featureAfter = draft.features.find((feature, i) => i === targetPosition)
					const newUserValue = avg(featureBefore?.userValue ?? 0, featureAfter?.userValue ?? 1)

					const existingStory = draft.stories.find((story) => story.id === startItem.id)!
					const newFeature: Feature = {
						id: existingStory.id,
						description: existingStory.description,
						effort: 0.5,
						name: existingStory.name,
						userValue: newUserValue,
						storyIds: [],
					}

					// Insert the story as a feature at the new location
					draft.features.push(newFeature)
					const newHost = draft.epics.find((epic) => epic.id === meta(targetLocation[1].id).parent)!
					newHost.featureIds.splice(targetPosition, 0, startItem.id)

					// Remove the story from its current location
					const currentHost = draft.features.find((feature) => feature.id === meta(startItem.id).parent)!
					currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
					draft.stories = draft.stories.filter((story) => story.id !== startItem.id)
				} else {
					const isForeign = meta(startItem.id).parent !== meta(targetLocation[1].id).parent
					if (isForeign) {
						// Story to story (reparenting)

						// Insert the story at the new location
						const host = draft.features.find((feature) => feature.id === meta(targetLocation[1].id).parent)!
						host.storyIds.splice(targetPosition, 0, startItem.id)

						// Remove the story from its current location
						const currentHost = draft.features.find((feature) => feature.id === meta(startItem.id).parent)!
						currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
					} else {
						// Story to story (reordering)

						const startPosition = meta(startItem.id).position
						const host = draft.features.find((feature) => feature.id === meta(startItem.id).parent)!

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

					const existingEpic = draft.epics.find((epic) => epic.id === startItem.id)!
					const newFeature: Feature = {
						id: existingEpic.id,
						description: existingEpic.description,
						effort: 0.5,
						name: existingEpic.name,
						userValue: 0.5,
						storyIds: existingEpic.featureIds,
					}

					// Insert the epic as a feature at the new location
					draft.features.push(newFeature)
					const host = draft.epics.find((epic) => epic.id === targetLocation[1].id)!
					host.featureIds.splice(0, 0, startItem.id)

					// Remove the epic from its current location
					draft.epics = draft.epics.filter((epic) => epic.id !== startItem.id)
				} else {
					// Epic to story is not allowed
					return
				}
			} else if (startItem.type === `feature`) {
				if (targetLocation[1].type === `epic`) {
					// Feature to another epic as first feature

					// Insert the feature at the new location
					const newHost = draft.epics.find((epic) => epic.id === targetLocation[1].id)!
					newHost.featureIds.splice(0, 0, startItem.id)

					// Remove the feature from its current location
					const currentHost = draft.epics.find((epic) => epic.id === meta(startItem.id).parent)!
					currentHost.featureIds = currentHost.featureIds.filter((featureId) => featureId !== startItem.id)
				} else if (targetLocation[1].type === `feature`) {
					// Feature to first story of another feature

					if (!currentVersion) return

					const existingFeature = draft.features.find((feature) => feature.id === startItem.id)!
					const newStory: Story = {
						id: existingFeature.id,
						acceptanceCriteria: [],
						branchName: null,
						createdAt: Timestamp.now(),
						description: existingFeature.description,
						designLink: null,
						ethicsApproved: null,
						ethicsColumn: null,
						ethicsVotes: [],
						name: existingFeature.name,
						pageLink: null,
						points: 0,
						sprintColumn: `productBacklog`,
						versionId: currentVersion,
					}

					// Insert the feature as a story at the new location
					draft.stories.push(newStory)
					const newHost = draft.features.find((feature) => feature.id === targetLocation[1].id)!
					newHost.storyIds.splice(0, 0, startItem.id)

					// Remove the feature from its current location
					const currentHost = draft.features.find((feature) => feature.id === meta(startItem.id).parent)!
					currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
					draft.features = draft.features.filter((feature) => feature.id !== startItem.id)

					// Delete the original feature's stories
					draft.stories = draft.stories.filter((story) => !existingFeature.storyIds.includes(story.id))
				}
			} else {
				if (targetLocation[1].type === `epic`) {
					// Story to epic is not allowed
					return
				} else if (targetLocation[1].type === `feature`) {
					// Story to first story of another feature

					// Insert the story at the new location
					const newHost = draft.features.find((feature) => feature.id === targetLocation[1].id)!
					newHost.storyIds.splice(0, 0, startItem.id)

					// Remove the story from its current location
					const currentHost = draft.features.find((feature) => feature.id === meta(startItem.id).parent)!
					currentHost.storyIds = currentHost.storyIds.filter((storyId) => storyId !== startItem.id)
				}
			}
		}
	})
