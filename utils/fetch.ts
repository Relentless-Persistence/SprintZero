import {addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where, writeBatch} from "firebase9/firestore"

import type {Id} from "~/types"
import type {Feature} from "~/types/db/Features"
import type {Product} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {Epic, EpicSchema, Epics, EpicCollectionSchema} from "~/types/db/Epics"
import {Features, FeatureCollectionSchema} from "~/types/db/Features"
import {Products, ProductCollectionSchema} from "~/types/db/Products"
import {Versions, VersionCollectionSchema} from "~/types/db/Versions"

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
		const existingDoc = (
			await getDocs(
				query(collection(db, Epics._), where(Epics.product, `==`, productId), where(Epics.name, `==`, name)),
			)
		).docs[0]
		if (existingDoc) throw new Error(`Epic already exists.`)

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
		if (lastEpicData) updateDoc(doc(db, Epics._, lastEpicData.id), {nextEpic: newEpicDoc.id})
	}

export const getAllEpics = (productId: Id) => async (): Promise<Epic[]> => {
	const _data = await getDocs(
		query(collection(db, Epics._), where(Epics.product, `==`, productId), orderBy(Epics.name)),
	)
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
		const existingDoc = (
			await getDocs(
				query(collection(db, Features._), where(Features.epic, `==`, epicId), where(Features.name, `==`, name)),
			)
		).docs[0]
		if (existingDoc) throw new Error(`Feature already exists.`)

		const data: Omit<Feature, `id`> = {
			description,
			name,
			comments: [],
			stories: [],
			product: productId,
			epic: epicId,
		}
		await addDoc(collection(db, Features._), data)
	}

export const getAllFeatures = (productId: Id) => async (): Promise<Feature[]> => {
	const _data = await getDocs(
		query(collection(db, Features._), where(Features.product, `==`, productId), orderBy(Features.name)),
	)
	const data = FeatureCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const renameFeature =
	(productId: Id, epicId: Id, featureId: Id) =>
	async (newName: string): Promise<void> => {
		const data: Partial<Feature> = {
			name: newName,
		}
		await updateDoc(doc(db, Features._, featureId), data)
	}
