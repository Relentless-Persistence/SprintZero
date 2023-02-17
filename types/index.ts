import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import type {FieldValue, FirestoreDataConverter} from "firebase/firestore"
import type {ZodSchema, ZodTypeDef} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

// Distinct from a regular Timestamp because onAuthStateChanged() can return null for serverTimestamp() sent to the server
export const serverTimestampSchema = z
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
	.union([z.instanceof(Timestamp), z.custom<FieldValue>((val) => (val as any)?._methodName === `serverTimestamp`)])
	.nullable()

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
