import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDocs,
	runTransaction,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore"
import {debounce} from "lodash"
import {nanoid} from "nanoid"

import type {QueryDocumentSnapshot, QuerySnapshot, WithFieldValue} from "firebase/firestore"
import type {Opaque, SetRequired} from "type-fest"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import {db} from "./firebase"
import {avg} from "./math"
import {StoryMapHistoryConverter} from "~/types/db/Products/StoryMapHistories"
import {HistoryItemConverter} from "~/types/db/Products/StoryMapHistories/HistoryItems"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"

export const addHistoryEntry = debounce(async (storyMapItems: QuerySnapshot<StoryMapItem>) => {
	const firstItem = storyMapItems.docs[0]
	if (!firstItem) return

	// eslint-disable-next-line @typescript-eslint/require-await
	await runTransaction(db, async (transaction) => {
		const historyId = nanoid()
		transaction.set(
			doc(db, firstItem.ref.parent.parent!.path, `StoryMapHistories`, historyId).withConverter(
				StoryMapHistoryConverter,
			),
			{
				future: false,
				timestamp: serverTimestamp(),
			},
		)
		storyMapItems.forEach((item) => {
			transaction.set(
				doc(db, item.ref.parent.parent!.path, `StoryMapHistories`, historyId, `HistoryItems`, item.id).withConverter(
					HistoryItemConverter,
				),
				item.data(),
			)
		})
	})
}, 1000)

export const updateItem = async (
	storyMapItems: QuerySnapshot<StoryMapItem>,
	id: string,
	data: WithFieldValue<Partial<StoryMapItem>>,
	allVersions: QuerySnapshot<Version>,
): Promise<void> => {
	const oldItems = storyMapItems

	const item = storyMapItems.docs.find((item) => item.id === id)!
	await updateDoc(item.ref, {
		...data,
		updatedAt: serverTimestamp(),
	})

	const newItems = await getDocs(
		collection(db, item.ref.parent.path, `StoryMapItems`).withConverter(StoryMapItemConverter),
	)

	if (
		JSON.stringify(getStoryMapShape(oldItems, allVersions)) !== JSON.stringify(getStoryMapShape(newItems, allVersions))
	)
		await addHistoryEntry(storyMapItems)
}

export const deleteItem = async (storyMapItems: QuerySnapshot<StoryMapItem>, id: string): Promise<void> => {
	const item = storyMapItems.docs.find((item) => item.id === id)!
	await updateDoc(item.ref, {
		deleted: true,
	})
	await addHistoryEntry(storyMapItems)
}

export const addEpic = async (
	storyMapItems: QuerySnapshot<StoryMapItem>,
	data: Partial<StoryMapItem>,
	userId: string,
): Promise<void> => {
	const epics = getEpics(storyMapItems)
	const firstEpic = epics[0]
	if (!firstEpic) return
	const lastEpic = epics.reduce((acc, cur) => (cur.data().userValue > acc.data().userValue ? cur : acc), firstEpic)

	await addDoc(firstEpic.ref.parent, {
		createdAt: Timestamp.now(),
		deleted: false,
		description: ``,
		effort: 0.5,
		name: `Epic ${epics.length + 1}`,
		userValue: avg(lastEpic.data().userValue, 1),
		keeperIds: [],

		acceptanceCriteria: [],
		branchName: null,
		bugs: [],
		designEffort: 1,
		designLink: null,
		engineeringEffort: 1,
		ethicsApproved: null,
		ethicsColumn: null,
		ethicsVotes: {},
		pageLink: null,
		sprintColumn: `releaseBacklog`,
		updatedAt: Timestamp.now(),
		parentId: null,
		peopleIds: [],
		updatedAtUserId: userId,
		versionId: null,
		...data,
	})
	await addHistoryEntry(storyMapItems)
}

export const getEpics = (storyMapItems: QuerySnapshot<StoryMapItem>): Array<QueryDocumentSnapshot<StoryMapItem>> => {
	const epics = storyMapItems.docs
		.filter((item) => item.data().parentId === null)
		.filter((item) => !item.data().deleted)
	return epics
}

export const sortEpics = (
	epics: Array<QueryDocumentSnapshot<StoryMapItem>>,
): Array<QueryDocumentSnapshot<StoryMapItem>> =>
	epics
		.sort((a, b) => a.data().name.localeCompare(b.data().name))
		.sort((a, b) => a.data().userValue - b.data().userValue)

export const addFeature = async (
	storyMapItems: QuerySnapshot<StoryMapItem>,
	data: SetRequired<Partial<StoryMapItem>, `parentId`>,
	userId: string,
): Promise<void> => {
	const features = getFeatures(storyMapItems)
	const firstFeature = features[0]
	if (!firstFeature) return
	const lastFeature = features.reduce(
		(acc, cur) => (cur.data().userValue > acc.data().userValue ? cur : acc),
		firstFeature,
	)

	await addDoc(firstFeature.ref.parent, {
		createdAt: Timestamp.now(),
		deleted: false,
		description: ``,
		effort: 0.5,
		name: `Feature ${features.length + 1}`,
		userValue: avg(lastFeature.data().userValue, 1),

		acceptanceCriteria: [],
		branchName: null,
		bugs: [],
		designEffort: 1,
		designLink: null,
		engineeringEffort: 1,
		ethicsApproved: null,
		ethicsColumn: null,
		ethicsVotes: {},
		pageLink: null,
		sprintColumn: `releaseBacklog`,
		updatedAt: Timestamp.now(),
		keeperIds: [],
		peopleIds: [],
		updatedAtUserId: userId,
		versionId: null,
		...data,
	})
	await addHistoryEntry(storyMapItems)
}

export const getFeatures = (storyMapItems: QuerySnapshot<StoryMapItem>): Array<QueryDocumentSnapshot<StoryMapItem>> => {
	const features = storyMapItems.docs
		.filter((item) => {
			const parent = storyMapItems.docs.find((parent) => parent.id === item.data().parentId)
			if (!parent) return false
			return parent.data().parentId === null
		})
		.filter((item) => !item.data().deleted)
	return features
}

// Assumes all features are siblings
export const sortFeatures = (
	features: Array<QueryDocumentSnapshot<StoryMapItem>>,
): Array<QueryDocumentSnapshot<StoryMapItem>> =>
	features
		.sort((a, b) => a.data().name.localeCompare(b.data().name))
		.sort((a, b) => a.data().userValue - b.data().userValue)

export const addStory = async (
	storyMapItems: QuerySnapshot<StoryMapItem>,
	data: SetRequired<Partial<StoryMapItem>, `parentId`>,
	userId: string,
	currentVersionId: string | typeof AllVersions,
): Promise<void> => {
	if (currentVersionId === AllVersions) return

	const stories = getStories(storyMapItems)
	const firstStory = stories[0]
	if (!firstStory) return

	await addDoc(firstStory.ref.parent, {
		acceptanceCriteria: [],
		branchName: null,
		bugs: [],
		createdAt: Timestamp.now(),
		deleted: false,
		description: ``,
		designEffort: 1,
		designLink: null,
		engineeringEffort: 1,
		ethicsApproved: null,
		ethicsColumn: null,
		ethicsVotes: {},
		name: `Story ${stories.length + 1}`,
		pageLink: null,
		sprintColumn: `releaseBacklog` as const,
		updatedAt: Timestamp.now(),
		peopleIds: [],
		updatedAtUserId: userId,
		versionId: currentVersionId,

		effort: 1,
		userValue: 0.5,
		keeperIds: [],
		...data,
	})
	await addHistoryEntry(storyMapItems)
}

export const getStories = (storyMapItems: QuerySnapshot<StoryMapItem>): Array<QueryDocumentSnapshot<StoryMapItem>> => {
	const stories = storyMapItems.docs
		.filter((item) => {
			const parent = storyMapItems.docs.find((parent) => parent.id === item.data().parentId)
			if (!parent) return false
			return parent.data().parentId !== null
		})
		.filter((item) => !item.data().deleted)
	return stories
}

// Assumes all stories are siblings
export const sortStories = (
	stories: Array<QueryDocumentSnapshot<StoryMapItem>>,
	allVersions: QuerySnapshot<Version>,
): Array<QueryDocumentSnapshot<StoryMapItem>> =>
	stories
		.sort((a, b) => a.data().createdAt.toMillis() - b.data().createdAt.toMillis())
		.sort((a, b) => {
			const aVersion = allVersions.docs.find((version) => version.id === a.data().versionId)
			const bVersion = allVersions.docs.find((version) => version.id === b.data().versionId)
			return aVersion?.exists() && bVersion?.exists() ? aVersion.data().name.localeCompare(bVersion.data().name) : 0
		})

export const getStoryMapShape = (
	storyMapItems: QuerySnapshot<StoryMapItem>,
	allVersions: QuerySnapshot<Version>,
): Array<{id: string; children: Array<{id: string; children: Array<{id: string}>}>}> => {
	const epics = sortEpics(getEpics(storyMapItems))
	const features = sortFeatures(getFeatures(storyMapItems))
	const stories = sortStories(getStories(storyMapItems), allVersions)

	const storyMapShape = epics.map((epic) => {
		const epicFeatures = features.filter((feature) => feature.data().parentId === epic.id)
		return {
			id: epic.id,
			children: epicFeatures.map((feature) => {
				const featureStories = stories.filter((story) => story.data().parentId === feature.id)
				return {
					id: feature.id,
					children: featureStories.map((story) => ({id: story.id})),
				}
			}),
		}
	})

	return storyMapShape
}

export const getItemType = (
	storyMapItems: QuerySnapshot<StoryMapItem>,
	itemId: string,
): `epic` | `feature` | `story` => {
	const parent = storyMapItems.docs.find((parent) => parent.id === itemId)
	const grandparent = parent && storyMapItems.docs.find((grandparent) => grandparent.id === parent.data().parentId)
	if (!parent && !grandparent) return `epic`
	if (!grandparent) return `feature`
	return `story`
}

export const AllVersions = `__ALL_VERSIONS__` as Opaque<string, `all_versions`>
