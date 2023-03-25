import {
	Timestamp,
	collection,
	doc,
	getDocs,
	runTransaction,
	serverTimestamp,
	setDoc,
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
		oldStoryMapItems: StoryMapItem[],
		versions: QuerySnapshot<Version>,
	) => {
		const storyMapItems = (
			await getDocs(collection(db, `Products`, product.id, `StoryMapItems`).withConverter(StoryMapItemConverter))
		).docs.map((item) => item.data())
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
					item,
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
	storyMapItems: StoryMapItem[],
	versions: QuerySnapshot<Version>,
	id: string,
	data: WithFieldValue<Partial<StoryMapItem>>,
): Promise<void> => {
	await updateDoc(doc(product.ref, `StoryMapItems`, id), {
		...data,
		updatedAt: Timestamp.now(),
	})
	await updateDoc(product.ref, {
		storyMapUpdatedAt: Timestamp.now(),
	})

	await addHistoryEntry(product, storyMapItems, versions)
}

export const debouncedUpdateItem = debounce(updateItem, 200)

export const updateItems = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: StoryMapItem[],
	versions: QuerySnapshot<Version>,
	data: Array<[string, WithFieldValue<Partial<StoryMapItem>>]>,
): Promise<void> => {
	const batch = writeBatch(db)
	data.forEach(([id, data]) => {
		return batch.update(doc(product.ref, `StoryMapItems`, id), {
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
	storyMapItems: StoryMapItem[],
	versions: QuerySnapshot<Version>,
	id: string,
): Promise<void> => {
	await updateDoc(doc(product.ref, `StoryMapItems`, id), {
		deleted: true,
	})
	await addHistoryEntry(product, storyMapItems, versions)
}

export const addEpic = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: StoryMapItem[],
	versions: QuerySnapshot<Version>,
	data: Partial<StoryMapItem>,
	userId: string,
): Promise<void> => {
	const epics = sortEpics(getEpics(storyMapItems))

	const id = nanoid()
	await setDoc(doc(product.ref, `StoryMapItems`, id).withConverter(StoryMapItemConverter), {
		id,

		createdAt: Timestamp.now(),
		deleted: false,
		description: ``,
		effort: 0.5,
		initialRenameDone: false,
		name: `Epic ${epics.length + 1}`,
		userValue: avg(epics.at(-1)?.userValue ?? 0, 1),
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

export const getEpics = (storyMapItems: StoryMapItem[]): StoryMapItem[] => {
	const epics = storyMapItems.filter((item) => item.parentId === null).filter((item) => !item.deleted)
	return epics
}

export const sortEpics = (epics: StoryMapItem[]): StoryMapItem[] =>
	epics.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.userValue - b.userValue)

export const addFeature = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: StoryMapItem[],
	versions: QuerySnapshot<Version>,
	data: SetRequired<Partial<StoryMapItem>, `parentId`>,
	userId: string,
): Promise<void> => {
	const features = sortFeatures(getFeatures(storyMapItems))

	const id = nanoid()
	await setDoc(doc(product.ref, `StoryMapItems`, id).withConverter(StoryMapItemConverter), {
		id,

		createdAt: Timestamp.now(),
		deleted: false,
		description: ``,
		effort: 0.5,
		initialRenameDone: false,
		name: `Feature ${features.length + 1}`,
		userValue: avg(features.at(-1)?.userValue ?? 0, 1),

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

export const getFeatures = (storyMapItems: StoryMapItem[]): StoryMapItem[] => {
	const epics = getEpics(storyMapItems)
	const features = storyMapItems
		.filter((item) => epics.some((epic) => epic.id === item.parentId))
		.filter((item) => !item.deleted)
	return features
}

// Assumes all features are siblings
export const sortFeatures = (features: StoryMapItem[]): StoryMapItem[] =>
	features.sort((a, b) => a.name.localeCompare(b.name)).sort((a, b) => a.userValue - b.userValue)

export const addStory = async (
	product: QueryDocumentSnapshot<Product>,
	storyMapItems: StoryMapItem[],
	versions: QuerySnapshot<Version>,
	data: SetRequired<Partial<StoryMapItem>, `parentId`>,
	userId: string,
	currentVersionId: string | typeof AllVersions,
): Promise<void> => {
	if (currentVersionId === AllVersions) return

	const stories = getStories(storyMapItems)
	const minUserValue =
		stories.length > 0
			? stories.reduce((min, story) => {
					return story.userValue < min ? story.userValue : min
			  }, stories[0].userValue)
			: 1
	const id = nanoid()
	const newUserValue = stories.length > 0 ? minUserValue - 0.001 : 1
	await setDoc(doc(product.ref, `StoryMapItems`, id).withConverter(StoryMapItemConverter), {
		id,

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
		initialRenameDone: false,
		name: `Story ${stories.length + 1}`,
		pageLink: null,
		sprintColumn: `releaseBacklog` as const,
		updatedAt: Timestamp.now(),
		peopleIds: [],
		updatedAtUserId: userId,
		versionId: currentVersionId,

		effort: 1,
		userValue: newUserValue,
		keeperIds: [],
		...data,
	})
	await addHistoryEntry(product, storyMapItems, versions)
}

export const getStories = (storyMapItems: StoryMapItem[]): StoryMapItem[] => {
	const features = getFeatures(storyMapItems)
	const stories = storyMapItems
		.filter((item) => features.some((feature) => feature.id === item.parentId))
		.filter((item) => !item.deleted)
	return stories
}

// Assumes all stories are siblings
export const sortStories = (stories: StoryMapItem[], allVersions: QuerySnapshot<Version>): StoryMapItem[] =>
	stories
		.sort((a, b) => b.userValue - a.userValue)
		//.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
		.sort((a, b) => {
			const aVersion = allVersions.docs.find((version) => version.id === a.versionId)
			const bVersion = allVersions.docs.find((version) => version.id === b.versionId)
			return aVersion?.exists() && bVersion?.exists() ? aVersion.data().name.localeCompare(bVersion.data().name) : 0
		})

export const getStoryMapShape = (
	storyMapItems: StoryMapItem[],
	allVersions: QuerySnapshot<Version>,
): Array<{id: string; children: Array<{id: string; children: Array<{id: string}>}>}> => {
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

export const getItemType = (storyMapItems: StoryMapItem[], itemId: string): `epic` | `feature` | `story` => {
	const epics = getEpics(storyMapItems)
	if (epics.some((epic) => epic.id === itemId)) return `epic`
	const features = getFeatures(storyMapItems)
	if (features.some((feature) => feature.id === itemId)) return `feature`
	const stories = getStories(storyMapItems)
	if (stories.some((story) => story.id === itemId)) return `story`
	throw new Error(`Item not found`)
}

export const AllVersions = `__ALL_VERSIONS__` as Opaque<string, `all_versions`>
