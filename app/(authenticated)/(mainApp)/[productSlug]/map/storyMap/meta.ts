import {Timestamp, serverTimestamp, updateDoc} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"

import type {DocumentReference, QuerySnapshot} from "firebase/firestore"
import type {SetRequired} from "type-fest"
import type {Id} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {avg} from "~/utils/math"
import {sortEpics, sortFeatures, sortStories} from "~/utils/storyMap"

export type UseGenMetaVars = {
	storyMapStateId: Id
	storyMapItems: StoryMapState[`items`]
	storyMapStateRef: DocumentReference<StoryMapState>
	allVersions: QuerySnapshot<Version>
	currentVersionId: Id | `__ALL_VERSIONS__`
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useGenMeta = ({
	storyMapStateId,
	storyMapItems,
	storyMapStateRef,
	allVersions,
	currentVersionId,
}: UseGenMetaVars) => {
	const epics = Object.entries(storyMapItems)
		.filter(([, item]) => item?.type === `epic`)
		.map(([id, item]) => ({id, ...item})) as Array<Epic & {id: Id}>
	const features = Object.entries(storyMapItems)
		.filter(([, item]) => item?.type === `feature`)
		.map(([id, item]) => ({id, ...item})) as Array<Feature & {id: Id}>
	const stories = Object.entries(storyMapItems)
		.filter(([, item]) => item?.type === `story`)
		.map(([id, item]) => ({id, ...item})) as Array<Story & {id: Id}>

	const storiesWithExtra = stories.map((story) => {
		const siblings = sortStories(
			stories.filter((sibling) => sibling.parentId === story.parentId),
			allVersions,
		)
		const position = siblings.findIndex((sibling) => sibling.id === story.id)

		return {...story, position}
	})
	const featuresWithExtra = features.map((feature) => {
		const siblings = sortFeatures(features.filter((sibling) => sibling.parentId === feature.parentId))
		const position = siblings.findIndex((sibling) => sibling.id === feature.id)

		return {
			...feature,
			childrenIds: sortStories(
				storiesWithExtra.filter((story) => story.parentId === feature.id),
				allVersions,
			).map((story) => story.id),
			position,
		}
	})
	const epicsWithExtra = sortEpics(epics).map((epic) => ({
		...epic,
		childrenIds: sortFeatures(featuresWithExtra.filter((feature) => feature.parentId === epic.id)).map(
			(feature) => feature.id,
		),
		position: epics.findIndex((sibling) => sibling.id === epic.id),
	}))

	return {
		storyMapStateId,
		currentVersionId,
		allVersions,

		epics: epicsWithExtra,
		addEpic: async (data: Partial<Epic>) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					const lastEpic =
						epics.length > 0
							? epics.reduce((acc, cur) => (cur.userValue > acc.userValue ? cur : acc), epics[0]!)
							: undefined
					draft[nanoid() as Id] = {
						type: `epic`,
						description: ``,
						effort: 0.5,
						name: `Epic ${epics.length + 1}`,
						userValue: avg(lastEpic?.userValue ?? 0, 1),
						keeperIds: [],

						acceptanceCriteria: null,
						branchName: null,
						bugs: null,
						createdAt: null,
						designLink: null,
						ethicsApproved: null,
						ethicsColumn: null,
						ethicsVotes: null,
						pageLink: null,
						points: null,
						sprintColumn: null,
						updatedAt: null,
						parentId: null,
						versionId: null,
						...data,
					}
				}),
				updatedAt: serverTimestamp(),
			})
		},
		updateEpic: async (epicId: Id, data: Partial<Epic>) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					draft[epicId] = {...(draft[epicId] as Epic), ...data}
				}),
			})
		},
		deleteEpic: async (epicId: Id) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					delete draft[epicId]
				}),
			})
		},

		features: featuresWithExtra,
		addFeature: async (data: SetRequired<Partial<Feature>, `parentId`>) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					const lastFeature =
						features.length > 0
							? features.reduce((acc, cur) => (cur.userValue > acc.userValue ? cur : acc), features[0]!)
							: undefined
					draft[nanoid() as Id] = {
						type: `feature`,
						description: ``,
						effort: 0.5,
						name: `Feature ${features.length + 1}`,
						userValue: avg(lastFeature?.userValue ?? 0, 1),

						acceptanceCriteria: null,
						branchName: null,
						bugs: null,
						createdAt: null,
						designLink: null,
						ethicsApproved: null,
						ethicsColumn: null,
						ethicsVotes: null,
						pageLink: null,
						points: null,
						sprintColumn: null,
						updatedAt: null,
						keeperIds: null,
						versionId: null,
						...data,
					}
				}),
				updatedAt: serverTimestamp(),
			})
		},
		updateFeature: async (featureId: Id, data: Partial<Feature>) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					draft[featureId] = {...(draft[featureId] as Feature), ...data}
				}),
			})
		},
		deleteFeature: async (featureId: Id) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					delete draft[featureId]
				}),
			})
		},

		stories: storiesWithExtra,
		addStory: async (data: SetRequired<Partial<Story>, `parentId`>) => {
			if (currentVersionId === `__ALL_VERSIONS__`) return
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					draft[nanoid() as Id] = {
						type: `story`,
						acceptanceCriteria: [],
						branchName: null,
						bugs: [],
						createdAt: Timestamp.now(),
						description: ``,
						designLink: null,
						ethicsApproved: null,
						ethicsColumn: null,
						ethicsVotes: [],
						name: `Story ${stories.length + 1}`,
						pageLink: null,
						points: 1,
						sprintColumn: `productBacklog`,
						updatedAt: Timestamp.now(),
						versionId: currentVersionId,

						effort: null,
						userValue: null,
						keeperIds: null,
						...data,
					}
				}),
				updatedAt: serverTimestamp(),
			})
		},
		updateStory: async (storyId: Id, data: Partial<Story>) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					draft[storyId] = {...(draft[storyId] as Story), ...data}
				}),
			})
		},
		deleteStory: async (storyId: Id) => {
			await updateDoc(storyMapStateRef, {
				items: produce(storyMapItems, (draft) => {
					delete draft[storyId]
				}),
			})
		},
	}
}

export type StoryMapMeta = ReturnType<typeof useGenMeta>
