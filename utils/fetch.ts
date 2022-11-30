import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	updateDoc,
	where,
	writeBatch,
} from "firebase9/firestore"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Product} from "~/types/db/Products"
import type {Story} from "~/types/db/Stories"
import type {Version} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {EpicSchema, Epics, EpicCollectionSchema} from "~/types/db/Epics"
import {FeatureSchema, Features, FeatureCollectionSchema} from "~/types/db/Features"
import {Products, ProductCollectionSchema} from "~/types/db/Products"
import {StorySchema, Stories, StoryCollectionSchema} from "~/types/db/Stories"
import {VersionSchema, Versions, VersionCollectionSchema} from "~/types/db/Versions"

export const getAllProducts = (userId: string) => async (): Promise<Product[]> => {
	const _data = await getDocs(
		query(collection(db, Products._), where(Products.owner, `==`, userId), orderBy(Products.name)),
	)
	const data = ProductCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getAllVersions = (productId: string) => async (): Promise<Version[]> => {
	const _data = await getDocs(
		query(collection(db, Versions._), where(Versions.product, `==`, productId), orderBy(Versions.name)),
	)
	const data = VersionCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const addVersion =
	(productId: Id) =>
	async (versionName: string): Promise<void> => {
		const existingDoc = (
			await getDocs(
				query(
					collection(db, Versions._),
					where(Versions.product, `==`, productId),
					where(Versions.name, `==`, versionName),
				),
			)
		).docs[0]
		if (existingDoc) throw new Error(`Version already exists.`)

		const data: Omit<Version, `id`> = {
			name: versionName,
			product: productId,
		}
		await addDoc(collection(db, Versions._), data)
	}

type AddEpicInput = {
	name: string
	description: string
}

export const addEpic =
	(productId: Id) =>
	async ({name, description}: AddEpicInput): Promise<void> => {
		const lastEpicData = (await getDocs(query(collection(db, Epics._), where(Epics.nextEpic, `==`, null)))).docs[0]
		const lastEpic = lastEpicData ? EpicSchema.parse({id: lastEpicData.id, ...lastEpicData.data()}) : null
		const data: Omit<Epic, `id` | `updatedAt`> = {
			description,
			name,
			keepers: [],
			comments: [],
			features: [],
			nextEpic: null,
			prevEpic: lastEpic?.id ?? null,
			product: productId,
		}
		const newEpicDoc = await addDoc(collection(db, Epics._), data)
		if (lastEpicData)
			updateDoc(doc(db, Epics._, lastEpicData.id), {nextEpic: newEpicDoc.id as Id} satisfies Partial<Epic>)
	}

export const getAllEpics = (productId: Id) => async (): Promise<Epic[]> => {
	const _data = await getDocs(query(collection(db, Epics._), where(Epics.product, `==`, productId)))
	const data = EpicCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const renameEpic =
	(epicId: Id) =>
	async (newName: string): Promise<void> => {
		const data: Partial<Epic> = {
			name: newName,
		}
		await updateDoc(doc(db, Epics._, epicId), data)
	}

export const reorderEpic = async (epicId: Id, after: Id | null, allEpics: Epic[]): Promise<void> => {
	const epic = allEpics.find((epic) => epic.id === epicId)!
	const afterEpic = after ? allEpics.find((epic) => epic.id === after)! : null

	const currentPrevEpic = epic.prevEpic
	const currentNextEpic = epic.nextEpic
	const futurePrevEpic = after
	const futureNextEpic = afterEpic?.nextEpic

	const batch = writeBatch(db)
	batch.update(doc(db, Epics._, epicId), {prevEpic: futurePrevEpic, nextEpic: futureNextEpic} satisfies Partial<Epic>)
	currentPrevEpic &&
		batch.update(doc(db, Epics._, currentPrevEpic), {nextEpic: currentNextEpic} satisfies Partial<Epic>)
	currentNextEpic &&
		batch.update(doc(db, Epics._, currentNextEpic), {prevEpic: currentPrevEpic} satisfies Partial<Epic>)
	futurePrevEpic && batch.update(doc(db, Epics._, futurePrevEpic), {nextEpic: epicId} satisfies Partial<Epic>)
	futureNextEpic && batch.update(doc(db, Epics._, futureNextEpic), {prevEpic: epicId} satisfies Partial<Epic>)
	await batch.commit()
}

type AddFeatureInput = {
	description: string
	name: string
}

export const addFeature =
	(productId: Id, epicId: Id) =>
	async ({description, name}: AddFeatureInput): Promise<void> => {
		const lastFeatureData = (
			await getDocs(
				query(collection(db, Features._), where(Features.epic, `==`, epicId), where(Features.nextFeature, `==`, null)),
			)
		).docs[0]
		const lastFeature = lastFeatureData
			? FeatureSchema.parse({id: lastFeatureData.id, ...lastFeatureData.data()})
			: null

		const data: Omit<Feature, `id`> = {
			description,
			name,
			comments: [],
			stories: [],
			epic: epicId,
			prevFeature: lastFeature?.id ?? null,
			nextFeature: null,
			product: productId,
		}
		const newFeatureDoc = await addDoc(collection(db, Features._), data)
		if (lastFeatureData)
			updateDoc(doc(db, Features._, lastFeatureData.id), {
				nextFeature: newFeatureDoc.id as Id,
			} satisfies Partial<Feature>)
	}

export const getFeaturesByEpic = (epicId: Id) => async (): Promise<Feature[]> => {
	const _data = await getDocs(query(collection(db, Features._), where(Features.epic, `==`, epicId)))
	const data = FeatureCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const renameFeature =
	(featureId: Id) =>
	async (newName: string): Promise<void> => {
		const data: Partial<Feature> = {
			name: newName,
		}
		await updateDoc(doc(db, Features._, featureId), data)
	}

type AddStoryInput = {
	description: string
	name: string
	version: Id
}

export const addStory =
	(productId: Id, epicId: Id, featureId: Id) =>
	async ({description, name, version}: AddStoryInput): Promise<void> => {
		const lastStoryData = (
			await getDocs(
				query(collection(db, Stories._), where(Stories.feature, `==`, featureId), where(Stories.nextStory, `==`, null)),
			)
		).docs[0]
		const lastStory = lastStoryData ? StorySchema.parse({id: lastStoryData.id, ...lastStoryData.data()}) : null

		const data: Omit<Story, `id`> = {
			accepanceCriteria: [],
			name,
			description,
			comments: [],
			epic: epicId,
			feature: featureId,
			nextStory: null,
			prevStory: lastStory?.id ?? null,
			product: productId,
			version,
		}
		const newStoryDoc = await addDoc(collection(db, Stories._), data)
		if (lastStoryData)
			updateDoc(doc(db, Stories._, lastStoryData.id), {
				nextStory: newStoryDoc.id as Id,
			} satisfies Partial<Story>)
	}

export const getStoriesByFeature = (featureId: Id) => async (): Promise<Story[]> => {
	const _data = await getDocs(query(collection(db, Stories._), where(Stories.feature, `==`, featureId)))
	const data = StoryCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const renameStory =
	(storyId: Id) =>
	async (newName: string): Promise<void> => {
		const data: Partial<Story> = {
			name: newName,
		}
		await updateDoc(doc(db, Stories._, storyId), data)
	}

export const getVersion = (versionId: Id) => async (): Promise<Version> => {
	const versionDoc = await getDoc(doc(db, Versions._, versionId))
	const data = VersionSchema.parse({id: versionDoc.id, ...versionDoc.data()})
	return data
}
