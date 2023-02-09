import {z} from "zod"

import type {DocumentReference, FirestoreDataConverter} from "firebase/firestore"
import type {ZodSchema, ZodTypeDef} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

export type WithDocumentData<T> = T & {
	id: Id
	ref: DocumentReference<T>
}

export const genConverter = <T extends Record<string, unknown>>(
	schema: ZodSchema<T, ZodTypeDef, unknown>,
): FirestoreDataConverter<WithDocumentData<T>> => ({
	toFirestore: (data) => schema.parse(data),
	fromFirestore: (snap) => ({
		...schema.parse(snap.data()),
		id: snap.id as Id,
		ref: snap.ref as DocumentReference<T>,
	}),
})
