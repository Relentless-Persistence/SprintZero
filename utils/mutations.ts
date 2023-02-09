import {addDoc, collection, doc, getDocs, query, updateDoc, where} from "firebase/firestore"

import type {Id} from "~/types"
import type {Comment} from "~/types/db/Comments"
import type {Product} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import {ProductSchema} from "~/types/db/Products"
import {db} from "~/utils/firebase"

type AddVersionVars = {
	storyMapStateId: Id
	versionName: string
}

export const addVersion = async ({storyMapStateId, versionName}: AddVersionVars): Promise<void> => {
	const existingDoc = (
		await getDocs(
			query(collection(db, `StoryMapStates`, storyMapStateId, `Versions`), where(`Versions.name`, `==`, versionName)),
		)
	).docs[0]
	if (existingDoc) throw new Error(`Version already exists.`)

	const data: Version = {
		name: versionName,
	}
	await addDoc(collection(db, `StoryMapStates`, storyMapStateId, `Versions`), data)
}

type UpdateProductVars = {
	id: Id
	data: Partial<Product>
}

export const updateProduct = async ({id, data}: UpdateProductVars): Promise<void> => {
	const validData = ProductSchema.partial().parse(data)
	await updateDoc(doc(db, `Products`, id), validData)
}

type AddCommentVars = {
	storyMapStateId: Id
	comment: Comment
}

export const addComment = async ({storyMapStateId, comment}: AddCommentVars): Promise<Id> => {
	const ref = await addDoc(collection(db, `StoryMapStates`, storyMapStateId, `Comments`), comment)
	return ref.id as Id
}
