import {Timestamp, setDoc} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"

import type {SetRequired} from "type-fest"
import type {Id, WithDocumentData} from "~/types"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {avg} from "~/utils/math"
import {sortEpics, sortFeatures, sortStories} from "~/utils/storyMap"

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useGenMeta = (
	storyMapState: WithDocumentData<StoryMapState>,
	allVersions: Array<WithDocumentData<Version>>,
	currentVersionId: Id | `__ALL_VERSIONS__`,
) => {
	const epics = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `epic`)
		.map(([id, item]) => ({id, ...item})) as Array<Epic & {id: Id}>
	const features = Object.entries(storyMapState.items)
		.filter(([, item]) => item?.type === `feature`)
		.map(([id, item]) => ({id, ...item})) as Array<Feature & {id: Id}>
	const stories = Object.entries(storyMapState.items)
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
		id: storyMapState.id,
		currentVersionId,

		epics: epicsWithExtra,
		addEpic: async (data: Partial<Epic>) => {
			const newData = produce(storyMapState, (draft) => {
				const lastEpic =
					epics.length > 0
						? epics.reduce((acc, cur) => (cur.userValue > acc.userValue ? cur : acc), epics[0]!)
						: undefined
				draft.items[nanoid() as Id] = {
					type: `epic`,
					description: ``,
					effort: 0.5,
					name: `Epic ${epics.length + 1}`,
					userValue: avg(lastEpic?.userValue ?? 0, 1),
					keeperIds: [],
					...data,
				}
			})
			await setDoc(storyMapState.ref, newData)
		},
		updateEpic: async (epicId: Id, data: Partial<Epic>) => {
			const newData = produce(storyMapState, (draft) => {
				draft.items[epicId] = {...(draft.items[epicId] as Epic), ...data}
			})
			await setDoc(storyMapState.ref, newData)
		},
		deleteEpic: async (epicId: Id) => {
			const data = produce(storyMapState, (draft) => {
				delete draft.items[epicId]
			})
			await setDoc(storyMapState.ref, data)
		},

		features: featuresWithExtra,
		addFeature: async (data: SetRequired<Partial<Feature>, `parentId`>) => {
			const newData = produce(storyMapState, (draft) => {
				const lastFeature =
					features.length > 0
						? features.reduce((acc, cur) => (cur.userValue > acc.userValue ? cur : acc), features[0]!)
						: undefined
				draft.items[nanoid() as Id] = {
					type: `feature`,
					description: ``,
					effort: 0.5,
					name: `Feature ${features.length + 1}`,
					userValue: avg(lastFeature?.userValue ?? 0, 1),
					...data,
				}
			})
			await setDoc(storyMapState.ref, newData)
		},
		updateFeature: async (featureId: Id, data: Partial<Feature>) => {
			const newData = produce(storyMapState, (draft) => {
				draft.items[featureId] = {...(draft.items[featureId] as Feature), ...data}
			})
			await setDoc(storyMapState.ref, newData)
		},
		deleteFeature: async (featureId: Id) => {
			const data = produce(storyMapState, (draft) => {
				delete draft.items[featureId]
			})
			await setDoc(storyMapState.ref, data)
		},

		stories: storiesWithExtra,
		addStory: async (data: SetRequired<Partial<Story>, `parentId`>) => {
			if (currentVersionId === `__ALL_VERSIONS__`) return
			const newData = produce(storyMapState, (draft) => {
				draft.items[nanoid() as Id] = {
					type: `story`,
					acceptanceCriteria: [],
					branchName: null,
					createdAt: Timestamp.now(),
					description: ``,
					designLink: null,
					ethicsApproved: null,
					ethicsColumn: null,
					ethicsVotes: [],
					name: `Story ${stories.length + 1}`,
					pageLink: null,
					points: 0,
					sprintColumn: `productBacklog`,
					versionId: currentVersionId,
					...data,
				}
			})
			await setDoc(storyMapState.ref, newData)
		},
		updateStory: async (storyId: Id, data: Partial<Story>) => {
			const newData = produce(storyMapState, (draft) => {
				draft.items[storyId] = {...(draft.items[storyId] as Story), ...data}
			})
			await setDoc(storyMapState.ref, newData)
		},
		deleteStory: async (storyId: Id) => {
			const data = produce(storyMapState, (draft) => {
				delete draft.items[storyId]
			})
			await setDoc(storyMapState.ref, data)
		},
	}
}

export type StoryMapMeta = ReturnType<typeof useGenMeta>
