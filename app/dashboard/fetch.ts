import {collection, getDocs, orderBy, query, where} from "firebase9/firestore"

import type {Product} from "~/types/db/Product"

import {db} from "~/config/firebase"
import {ProductCollectionSchema} from "~/types/db/Product"

export const getAllProducts = (userId?: string) => async (): Promise<Product[]> => {
	const _data = await getDocs(query(collection(db, `Product`), where(`owner`, `==`, userId), orderBy(`product`)))
	const data = ProductCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}
