import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDocs,
	runTransaction,
	serverTimestamp,
	updateDoc,
	writeBatch,
} from "firebase/firestore"
import {debounce} from "lodash"
import {nanoid} from "nanoid"

import type {QueryDocumentSnapshot, QuerySnapshot, WithFieldValue} from "firebase/firestore"
import type {Opaque, SetRequired} from "type-fest"
import type {Product} from "~/types/db/Products"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import {db} from "./firebase"
import {avg} from "./math"
import {StoryMapHistoryConverter} from "~/types/db/Products/StoryMapHistories"
import {HistoryItemConverter} from "~/types/db/Products/StoryMapHistories/HistoryItems"
import {StoryMapItemConverter} from "~/types/db/Products/StoryMapItems"

export const addHistoryEntry = debounce(
	async (
		product: QueryDocumentSnapshot<Product>,
		oldStoryMapItems: QuerySnapshot<StoryMapItem>,
		versions: QuerySnapshot<Version>,
	) => {
		const storyMapItems = await getDocs(
			collection(db, `Products`, product.id, `StoryMapItems`).withConverter(StoryMapItemConverter),
		)
		if (
			JSON.stringify(getStoryMapShape(oldStoryMapItems, versions)) ===
			JSON.stringify(getStoryMapShape(storyMapItems, versions))
		)
			return

		// eslint-disable-next-line @typescript-eslint/require-await -- Callback requires Promise return
		await runTransaction(db, async (transaction) => {
			const historyId = nanoid()
			transaction.set(doc(product.ref, `StoryMapHistories`, historyId).withConverter(StoryMapHistoryConverter), {
				future: false,
				timestamp: serverTimestamp(),
			})
			storyMapItems.forEach((item) => {
				transaction.set(
					doc(product.ref, `StoryMapHistories`, historyId, `HistoryItems`, item.id).withConverter(HistoryItemConverter),
					item.data(),
				)
			})
			transaction.update(product.ref, {
				storyMapCurrentHistoryId: historyId,
			})
		})
	},
	1000,
)

export const updateItem = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: QuerySnapshot<StoryMapItem>,
	versions: QuerySnapshot<Version>,
	id: string,
	data: WithFieldValue<Partial<StoryMapItem>>,
): Promise<void> => {
	const item = storyMapItems.docs.find((item) => item.id === id)!
	await updateDoc(item.ref, {
		...data,
		updatedAt: Timestamp.now(),
	})
	await updateDoc(product.ref, {
		storyMapUpdatedAt: Timestamp.now(),
	})

	await addHistoryEntry(product, storyMapItems, versions)
}

export const updateItems = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: QuerySnapshot<StoryMapItem>,
	versions: QuerySnapshot<Version>,
	data: Array<[string, WithFieldValue<Partial<StoryMapItem>>]>,
): Promise<void> => {
	const batch = writeBatch(db)
	data.forEach(([id, data]) => {
		const item = storyMapItems.docs.find((item) => item.id === id)!
		return batch.update(item.ref, {
			...data,
			updatedAt: Timestamp.now(),
		})
	})
	batch.update(product.ref, {
		storyMapUpdatedAt: Timestamp.now(),
	})
	await batch.commit()

	await addHistoryEntry(product, storyMapItems, versions)
}

export const deleteItem = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: QuerySnapshot<StoryMapItem>,
	versions: QuerySnapshot<Version>,
	id: string,
): Promise<void> => {
	const item = storyMapItems.docs.find((item) => item.id === id)!
	await updateDoc(item.ref, {
		deleted: true,
	})
	await addHistoryEntry(product, storyMapItems, versions)
}

export const addEpic = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: QuerySnapshot<StoryMapItem>,
	versions: QuerySnapshot<Version>,
	data: Partial<StoryMapItem>,
	userId: string,
): Promise<void> => {
	const epics = sortEpics(getEpics(storyMapItems))

	await addDoc(collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter), {
		createdAt: Timestamp.now(),
		deleted: false,
		description: ``,
		effort: 0.5,
		name: `Epic ${epics.length + 1}`,
		userValue: avg(epics.at(-1)?.data().userValue ?? 0, 1),
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
	await addHistoryEntry(product, storyMapItems, versions)
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
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: QuerySnapshot<StoryMapItem>,
	versions: QuerySnapshot<Version>,
	data: SetRequired<Partial<StoryMapItem>, `parentId`>,
	userId: string,
): Promise<void> => {
	const features = sortFeatures(getFeatures(storyMapItems))

	await addDoc(collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter), {
		createdAt: Timestamp.now(),
		deleted: false,
		description: ``,
		effort: 0.5,
		name: `Feature ${features.length + 1}`,
		userValue: avg(features.at(-1)?.data().userValue ?? 0, 1),

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
	await addHistoryEntry(product, storyMapItems, versions)
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
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: QuerySnapshot<StoryMapItem>,
	versions: QuerySnapshot<Version>,
	data: SetRequired<Partial<StoryMapItem>, `parentId`>,
	userId: string,
	currentVersionId: string | typeof AllVersions,
): Promise<void> => {
	if (currentVersionId === AllVersions) return

	const stories = getStories(storyMapItems)
	await addDoc(collection(product.ref, `StoryMapItems`).withConverter(StoryMapItemConverter), {
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
	await addHistoryEntry(product, storyMapItems, versions)
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
	const item = storyMapItems.docs.find((item) => item.id === itemId)!
	const parent = storyMapItems.docs.find((i) => i.id === item.data().parentId)
	const grandparent = parent && storyMapItems.docs.find((grandparent) => grandparent.id === parent.data().parentId)
	if (!parent && !grandparent) return `epic`
	if (!grandparent) return `feature`
	return `story`
}

export const AllVersions = `__ALL_VERSIONS__` as Opaque<string, `all_versions`>
