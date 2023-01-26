import {collection, doc, getDoc, getDocs, orderBy, query, where} from "firebase9/firestore"

import type {Id} from "~/types"
import type {Comment} from "~/types/db/Comments"
import type {Product} from "~/types/db/Products"
import type {User} from "~/types/db/Users"
import type {Version} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {Comments, CommentSchema} from "~/types/db/Comments"
import {ProductSchema, Products} from "~/types/db/Products"
import {Users, UserSchema} from "~/types/db/Users"
import {VersionSchema, Versions} from "~/types/db/Versions"

export const getUser = (id: Id) => async (): Promise<User> => {
	const _data = await getDoc(doc(db, Users._, id))
	const data = UserSchema.parse({id: _data.id, ..._data.data()})
	return data
}

export const getProduct = (id: Id) => async (): Promise<Product> => {
	const productDoc = await getDoc(doc(db, Products._, id))
	const product = ProductSchema.parse({id: productDoc.id, ...productDoc.data()})
	return product
}

export const getProductsByUser = (userId: Id) => async (): Promise<Product[]> => {
	const _user = await getDoc(doc(db, Users._, userId))
	const user = UserSchema.parse({id: _user.id, ..._user.data()})
	const queries = user.products.map((productId) => getDoc(doc(db, Products._, productId)))

	const _data = await Promise.all(queries)
	const data = ProductSchema.array().parse(_data.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getVersionsByProduct = (productId: Id) => async (): Promise<Version[]> => {
	const _data = await getDocs(
		query(collection(db, Versions._), where(Versions.product, `==`, productId), orderBy(Versions.name)),
	)
	const data = VersionSchema.array().parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getComment = (id: Id) => async (): Promise<Comment> => {
	const _data = await getDoc(doc(db, Comments._, id))
	const data = CommentSchema.parse({id: _data.id, ..._data.data()})
	return data
}
