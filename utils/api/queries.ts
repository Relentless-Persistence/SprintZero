import {collection, doc, getDoc, getDocs, orderBy, query, where} from "firebase/firestore"

import type {DocumentReference} from "firebase/firestore"
import type {Id, WithDocumentData} from "~/types"
import type {Comment} from "~/types/db/Comments"
import type {Product} from "~/types/db/Products"
import type {User} from "~/types/db/Users"
import type {Version} from "~/types/db/Versions"

import {db} from "~/utils/firebase"
import {Comments, CommentSchema} from "~/types/db/Comments"
import {ProductSchema, Products} from "~/types/db/Products"
import {Users, UserSchema} from "~/types/db/Users"
import {VersionSchema, Versions} from "~/types/db/Versions"

export const getUser = (id: Id) => async (): Promise<WithDocumentData<User> | undefined> => {
	try {
		const data = await getDoc(doc(db, Users._, id))
		return {
			...UserSchema.parse(data.data()),
			id: data.id as Id,
			ref: data.ref as DocumentReference<User>,
		}
	} catch (e) {
		console.error(e)
	}
}

export const getProduct = (id: Id) => async (): Promise<WithDocumentData<Product> | undefined> => {
	try {
		const data = await getDoc(doc(db, Products._, id))
		return {
			...ProductSchema.parse(data.data()),
			id: data.id as Id,
			ref: data.ref as DocumentReference<Product>,
		}
	} catch (e) {
		console.error(e)
	}
}

export const getProductsByUser = (userId: Id) => async (): Promise<WithDocumentData<Product>[]> => {
	try {
		const data = await getDocs(
			// TODO: this is not the final intended query
			query(collection(db, Products._), where(`${Products.members}.${userId}.type`, `==`, `editor`)),
		)
		return data.docs.map((doc) => ({
			...ProductSchema.parse(doc.data()),
			id: doc.id as Id,
			ref: doc.ref as DocumentReference<Product>,
		}))
	} catch (e) {
		console.error(e)
		return []
	}
}

export const getAllVersions = (productId: Id) => async (): Promise<WithDocumentData<Version>[]> => {
	try {
		const data = await getDocs(query(collection(db, Products._, productId, Versions._), orderBy(Versions.name)))
		return data.docs.map((doc) => ({
			...VersionSchema.parse(doc.data()),
			id: doc.id as Id,
			ref: doc.ref as DocumentReference<Version>,
		}))
	} catch (e) {
		console.error(e)
		return []
	}
}

export const getComment = (id: Id, productId: Id) => async (): Promise<WithDocumentData<Comment> | undefined> => {
	try {
		const data = await getDoc(doc(db, Products._, productId, Comments._, id))
		return {
			...CommentSchema.parse(data.data()),
			id: data.id as Id,
			ref: data.ref as DocumentReference<Comment>,
		}
	} catch (e) {
		console.error(e)
	}
}
