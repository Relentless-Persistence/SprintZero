import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import type {FirestoreDataConverter} from "firebase/firestore"
import type {ZodSchema, ZodTypeDef} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

// Distinct from a regular Timestamp because onAuthStateChanged() can return null for serverTimestamp() sent to the server
export const serverTimestampSchema = z.instanceof(Timestamp).nullable()

export const genConverter = <T extends Record<string, unknown>>(
	schema: ZodSchema<T, ZodTypeDef, unknown>,
): FirestoreDataConverter<T> => ({
	toFirestore: (data) => {
		return schema.parse(data)
	},
	fromFirestore: (snap) => {
		return schema.parse(snap.data())
	},
})
