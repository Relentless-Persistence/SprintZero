import {
	Timestamp,
	addDoc,
	collection,
	deleteDoc,
	deleteField,
	documentId,
	getDoc,
	getDocs,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from "firebase/firestore"
import {debounce} from "lodash"
import {nanoid} from "nanoid"

import type {QueryDocumentSnapshot, QuerySnapshot, WithFieldValue} from "firebase/firestore"
import type {SetRequired} from "type-fest"
import type {Id} from "~/types"
import type {History} from "~/types/db/Histories"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {db} from "./firebase"
import {avg} from "./math"
import {HistoryConverter} from "~/types/db/Histories"

const addHistoryEntry = debounce(async (storyMapState: QueryDocumentSnapshot<StoryMapState>) => {
	const newItems = await getDoc(storyMapState.ref)
	if (!newItems.exists()) throw new Error(`Failed to add epic`)
	await Promise.all([
		(async () => {
			const ref = await addDoc(
				collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
				{
					future: false,
					items: newItems.data().items,
					timestamp: serverTimestamp(),
				},
			)
			await updateDoc(storyMapState.ref, {currentHistoryId: ref.id as Id})
		})(),
		(async () => {
			const futureHistories = await getDocs(
				query(
					collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
					where(`future`, `==`, true),
				),
			)
			await Promise.all(futureHistories.docs.map((doc) => deleteDoc(doc.ref)))
		})(),
	])
}, 1000)

export const updateItem = async (
	storyMapState: QueryDocumentSnapshot<StoryMapState>,
	id: Id,
	data: Partial<WithFieldValue<Epic>> | Partial<WithFieldValue<Feature>> | Partial<WithFieldValue<Story>>,
	allVersions: QuerySnapshot<Version>,
): Promise<void> => {
	const newData: WithFieldValue<Partial<StoryMapState> & {[key: `items.${Id}.`]: Epic | Feature | Story}> = {
		[`items.${id}`]: {...storyMapState.data().items[id], ...data} as Epic | Feature | Story,
		updatedAt: serverTimestamp(),
	}
	await updateDoc(storyMapState.ref, newData)

	const oldItems = storyMapState.data().items
	const newItems = await getDoc(storyMapState.ref)
	if (!newItems.exists()) throw new Error(`Shouldn't happen`)

	if (
		JSON.stringify(getStoryMapShape(oldItems, allVersions)) !==
		JSON.stringify(getStoryMapShape(newItems.data().items, allVersions))
	)
		await addHistoryEntry(storyMapState)
}

export const deleteItem = async (storyMapState: QueryDocumentSnapshot<StoryMapState>, id: Id): Promise<void> => {
	const data: WithFieldValue<Partial<StoryMapState> & {[key: `items.${Id}.`]: Epic | Feature | Story}> = {
		[`items.${id}`]: deleteField(),
		updatedAt: serverTimestamp(),
	}
	await updateDoc(storyMapState.ref, data)
	const histories = await getDocs(
		query(
			collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
			where(documentId(), `==`, storyMapState.data().currentHistoryId),
		),
	)
	await Promise.all(histories.docs.map((doc) => deleteDoc(doc.ref)))
	await addHistoryEntry(storyMapState)
}

export const addEpic = async (
	storyMapState: QueryDocumentSnapshot<StoryMapState>,
	data: Partial<Epic>,
): Promise<void> => {
	const epics = getEpics(storyMapState.data().items)
	const lastEpic =
		epics.length > 0 ? epics.reduce((acc, cur) => (cur.userValue > acc.userValue ? cur : acc), epics[0]!) : undefined

	const newData: WithFieldValue<Partial<StoryMapState> & {[key: `items.${Id}.`]: Epic}> = {
		[`items.${nanoid()}`]: {
			type: `epic` as const,
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
		},
		updatedAt: serverTimestamp(),
	}
	await updateDoc(storyMapState.ref, newData)

	const histories = await getDocs(
		query(
			collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
			where(documentId(), `==`, storyMapState.data().currentHistoryId),
		),
	)
	await Promise.all(histories.docs.map((doc) => deleteDoc(doc.ref)))
	await addHistoryEntry(storyMapState)
}

export const getEpics = (storyMapItems: History[`items`]): Array<Epic & {id: Id}> => {
	const epics = Object.entries(storyMapItems)
		.filter(([, item]) => item?.type === `epic`)
		.map(([id, item]) => ({id, ...item})) as Array<Epic & {id: Id}>
	return epics
}

export const sortEpics = <T extends Epic>(epics: T[]): T[] =>
	epics.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.userValue - b.userValue)

export const addFeature = async (
	storyMapState: QueryDocumentSnapshot<StoryMapState>,
	data: SetRequired<Partial<Feature>, `parentId`>,
): Promise<void> => {
	const features = getFeatures(storyMapState.data().items)
	const lastFeature =
		features.length > 0
			? features.reduce((acc, cur) => (cur.userValue > acc.userValue ? cur : acc), features[0]!)
			: undefined

	const newData: WithFieldValue<Partial<StoryMapState> & {[key: `items.${Id}.`]: Feature}> = {
		[`items.${nanoid()}`]: {
			type: `feature` as const,
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
		},
		updatedAt: serverTimestamp(),
	}
	await updateDoc(storyMapState.ref, newData)

	const histories = await getDocs(
		query(
			collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
			where(documentId(), `==`, storyMapState.data().currentHistoryId),
		),
	)
	await Promise.all(histories.docs.map((doc) => deleteDoc(doc.ref)))
	await addHistoryEntry(storyMapState)
}

export const getFeatures = (storyMapItems: History[`items`]): Array<Feature & {id: Id}> => {
	const features = Object.entries(storyMapItems)
		.filter(([, item]) => item?.type === `feature`)
		.map(([id, item]) => ({id, ...item})) as Array<Feature & {id: Id}>
	return features
}

// Assumes all features are siblings
export const sortFeatures = <T extends Feature>(features: T[]): T[] =>
	features.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.userValue - b.userValue)

export const addStory = async (
	storyMapState: QueryDocumentSnapshot<StoryMapState>,
	currentVersionId: Id | `__ALL_VERSIONS__`,
	data: SetRequired<Partial<Story>, `parentId`>,
): Promise<void> => {
	if (currentVersionId === `__ALL_VERSIONS__`) return

	const stories = getStories(storyMapState.data().items)

	const newData: WithFieldValue<Partial<StoryMapState> & {[key: `items.${Id}.`]: Story}> = {
		[`items.${nanoid()}`]: {
			type: `story` as const,
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
			sprintColumn: `productBacklog` as const,
			updatedAt: Timestamp.now(),
			versionId: currentVersionId,

			effort: null,
			userValue: null,
			keeperIds: null,
			...data,
		},
		updatedAt: serverTimestamp(),
	}
	await updateDoc(storyMapState.ref, newData)

	const histories = await getDocs(
		query(
			collection(db, `StoryMapStates`, storyMapState.id, `Histories`).withConverter(HistoryConverter),
			where(documentId(), `==`, storyMapState.data().currentHistoryId),
		),
	)
	await Promise.all(histories.docs.map((doc) => deleteDoc(doc.ref)))
	await addHistoryEntry(storyMapState)
}

export const getStories = (storyMapItems: History[`items`]): Array<Story & {id: Id}> => {
	const stories = Object.entries(storyMapItems)
		.filter(([, item]) => item?.type === `story`)
		.map(([id, item]) => ({id, ...item})) as Array<Story & {id: Id}>
	return stories
}

// Assumes all stories are siblings
export const sortStories = <T extends Story>(stories: T[], allVersions: QuerySnapshot<Version>): T[] =>
	stories
		.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
		.sort((a, b) => {
			const aVersion = allVersions.docs.find((version) => version.id === a.versionId)
			const bVersion = allVersions.docs.find((version) => version.id === b.versionId)
			return aVersion?.exists() && bVersion?.exists() ? aVersion.data().name.localeCompare(bVersion.data().name) : 0
		})

export const getStoryMapShape = (
	storyMapItems: History[`items`],
	allVersions: QuerySnapshot<Version>,
): Array<{id: Id; children: Array<{id: Id; children: Array<{id: Id}>}>}> => {
	const epics = sortEpics(getEpics(storyMapItems))
	const features = sortFeatures(getFeatures(storyMapItems))
	const stories = sortStories(getStories(storyMapItems), allVersions)

	const storyMapShape = epics.map((epic) => {
		const epicFeatures = features.filter((feature) => feature.parentId === epic.id)
		return {
			id: epic.id,
			children: epicFeatures.map((feature) => {
				const featureStories = stories.filter((story) => story.parentId === feature.id)
				return {
					id: feature.id,
					children: featureStories.map((story) => ({id: story.id})),
				}
			}),
		}
	})

	return storyMapShape
}
