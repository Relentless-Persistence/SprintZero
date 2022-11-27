import {addDoc, collection, getDocs, orderBy, query, where} from "firebase9/firestore"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Product} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {Epics, EpicCollectionSchema} from "~/types/db/Epics"
import {Products, ProductCollectionSchema} from "~/types/db/Products"
import {Versions, VersionCollectionSchema} from "~/types/db/Versions"

export const getAllProducts = (userId: string) => async (): Promise<Product[]> => {
	const _data = await getDocs(
		query(collection(db, Products._), where(Products.owner, `==`, userId), orderBy(Products.product)),
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
		if (existingDoc) throw new Error(`Version name taken.`)

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
		const data: Omit<Epic, `id` | `updatedAt`> = {
			description,
			name,
			keepers: [],
			comments: [],
			features: [],
			product: productId,
		}
		await addDoc(collection(db, Epics._), data)
	}

export const getAllEpics = (productId: Id) => async (): Promise<Epic[]> => {
	const _data = await getDocs(
		query(collection(db, Epics._), where(Epics.product, `==`, productId), orderBy(Epics.name)),
	)
	const data = EpicCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const addFeature =
	(epicId: Id) =>
	async (featureName: Id): Promise<void> => {
		const existingDoc = (
			await getDocs(
				query(
					collection(db, Epics._),
					where(Epics.id, `==`, epicId),
					where(Epics.features, `array-contains`, featureName),
				),
			)
		).docs[0]
		if (existingDoc) throw new Error(`Feature name taken.`)

		const data: Omit<Epic, `id` | `updatedAt`> = {
			features: [featureName],
		}
		await addDoc(collection(db, Epics._), data)
	}
