import {addDoc, collection, getDocs, orderBy, query, where} from "firebase9/firestore"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Product} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {NEpics, EpicCollectionSchema} from "~/types/db/Epics"
import {NProducts, ProductCollectionSchema} from "~/types/db/Products"
import {NVersions, VersionCollectionSchema} from "~/types/db/Versions"

export const getAllProducts = (userId: string) => async (): Promise<Product[]> => {
	const _data = await getDocs(
		query(collection(db, NProducts.n), where(NProducts.owner.n, `==`, userId), orderBy(NProducts.product.n)),
	)
	const data = ProductCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getAllVersions = (productId: string) => async (): Promise<Version[]> => {
	const _data = await getDocs(
		query(collection(db, NVersions.n), where(NVersions.product.n, `==`, productId), orderBy(NVersions.name.n)),
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
					collection(db, NVersions.n),
					where(NVersions.product.n, `==`, productId),
					where(NVersions.name.n, `==`, versionName),
				),
			)
		).docs[0]
		if (existingDoc) throw new Error(`Version name taken.`)

		const data: Omit<Version, `id`> = {
			name: versionName,
			product: productId,
		}
		await addDoc(collection(db, NVersions.n), data)
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
		await addDoc(collection(db, NEpics.n), data)
	}

export const getAllEpics = (productId: string) => async (): Promise<Epic[]> => {
	const _data = await getDocs(
		query(collection(db, NEpics.n), where(NEpics.product.n, `==`, productId), orderBy(NEpics.name.n)),
	)
	const data = EpicCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}
