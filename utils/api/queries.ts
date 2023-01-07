import {collection, doc, getDoc, getDocs, orderBy, query, where} from "firebase9/firestore"

import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Product} from "~/types/db/Products"
import type {Story} from "~/types/db/Stories"
import type {User} from "~/types/db/Users"
import type {Version} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {EpicSchema, Epics} from "~/types/db/Epics"
import {FeatureSchema, Features} from "~/types/db/Features"
import {ProductSchema, Products} from "~/types/db/Products"
import {StorySchema, Stories} from "~/types/db/Stories"
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

export const getEpic = (epicId: Id) => async (): Promise<Epic> => {
	const epicDoc = await getDoc(doc(db, Epics._, epicId))
	const epic = EpicSchema.parse({id: epicDoc.id, ...epicDoc.data()})
	return epic
}

export const getEpicsByProduct = (productId: Id) => async (): Promise<Epic[]> => {
	const _data = await getDocs(query(collection(db, Epics._), where(Epics.product, `==`, productId)))
	const data = EpicSchema.array().parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getFeature = (featureId: Id) => async (): Promise<Feature> => {
	const featureDoc = await getDoc(doc(db, Features._, featureId))
	const feature = FeatureSchema.parse({id: featureDoc.id, ...featureDoc.data()})
	return feature
}

export const getFeaturesByEpic = (epicId: Id) => async (): Promise<Feature[]> => {
	const _data = await getDocs(query(collection(db, Features._), where(Features.epic, `==`, epicId)))
	const data = FeatureSchema.array().parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getFeaturesByProduct = (productId: Id) => async (): Promise<Feature[]> => {
	const _data = await getDocs(query(collection(db, Features._), where(Features.product, `==`, productId)))
	const data = FeatureSchema.array().parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getStoriesByProduct = (productId: Id) => async (): Promise<Story[]> => {
	const _data = await getDocs(query(collection(db, Stories._), where(Stories.product, `==`, productId)))
	const data = StorySchema.array().parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getStoriesByEpic = (epicId: Id) => async (): Promise<Story[]> => {
	const _data = await getDocs(query(collection(db, Stories._), where(Stories.epic, `==`, epicId)))
	const data = StorySchema.array().parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getStoriesByFeature = (featureId: Id) => async (): Promise<Story[]> => {
	const _data = await getDocs(query(collection(db, Stories._), where(Stories.feature, `==`, featureId)))
	const data = StorySchema.array().parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}
