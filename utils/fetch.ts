import {collection, getDocs, orderBy, query, where} from "firebase9/firestore"

import type {Product} from "~/types/db/Product"
import type {Versions} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {ProductCollectionSchema} from "~/types/db/Product"
import {VersionsCollectionSchema} from "~/types/db/Versions"

export const getAllProducts = (userId?: string) => async (): Promise<Product[]> => {
	const _data = await getDocs(query(collection(db, `Product`), where(`owner`, `==`, userId), orderBy(`product`)))
	const data = ProductCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getAllVersions = (productId: string | null) => async (): Promise<Versions[]> => {
	const _data = await getDocs(
		query(collection(db, `Versions`), where(`product_id`, `==`, productId), orderBy(`version`)),
	)
	const data = VersionsCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}
