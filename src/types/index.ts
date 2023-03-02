import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import type {FieldValue, FirestoreDataConverter} from "firebase/firestore"
import type {FirestoreDataConverter as AdminFirestoreDataConverter} from "firebase-admin/firestore"
import type {ZodSchema, ZodTypeDef} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

// Has to accept both "firebase/firestore" and "firebase-admin/firestore" Timestamp types. I can't import
// "firebase-admin/firestore" here because it's server-only and this file is shared between client and server.
// So here I'm just testing for some properties that exist on Timestamp objects and hoping it's always correct.
export const timestampSchema = z.custom<Timestamp>(
	(val) => typeof val === `object` && val !== null && `toDate` in val && `seconds` in val && `nanoseconds` in val,
)

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

export const genAdminConverter = <T extends Record<string, unknown>>(
	schema: ZodSchema<T, ZodTypeDef, unknown>,
): AdminFirestoreDataConverter<T> => ({
	toFirestore: (data) => {
		return schema.parse(data)
	},
	fromFirestore: (snap) => {
		return schema.parse(snap.data())
	},
})
