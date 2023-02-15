import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import type {DocumentReference, FirestoreDataConverter} from "firebase/firestore"
import type {ZodSchema, ZodTypeDef} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

// Distinct from a regular Timestamp because onAuthStateChanged() can return null for serverTimestamp() sent to the server
export const serverTimestampSchema = z.instanceof(Timestamp).nullable()

export type WithDocumentData<T> = T & {
	id: Id
	ref: DocumentReference<T>
}

export const genConverter = <T extends Record<string, unknown>>(
	schema: ZodSchema<T, ZodTypeDef, unknown>,
): FirestoreDataConverter<WithDocumentData<T>> => ({
	toFirestore: (data) => {
		return schema.parse(data)
	},
	fromFirestore: (snap) => {
		return {
			...schema.parse(snap.data()),
			id: snap.id as Id,
			ref: snap.ref as DocumentReference<T>,
		}
	},
})
