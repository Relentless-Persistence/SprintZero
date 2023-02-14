import {FieldPath, Timestamp} from "firebase/firestore"
import {ZodArray, ZodObject, ZodRecord, ZodTuple, ZodUnion, z} from "zod"

import type {DocumentReference, FirestoreDataConverter} from "firebase/firestore"
import type {AnyZodObject, ZodSchema, ZodTypeAny, ZodTypeDef} from "zod"

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
		// const addFieldValues = (schema: ZodTypeAny): ZodTypeAny => {
		// 	if (schema instanceof ZodObject) {
		// 		let newSchema = z.object({})
		// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		// 		for (const [key, value] of schema.shape) {
		// 			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		// 			newSchema = newSchema.extend({[key]: addFieldValues(value)})
		// 		}
		// 		return newSchema
		// 	} else if (schema instanceof ZodArray) {
		// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		// 		return z.array(addFieldValues(schema.element))
		// 	} else if (schema instanceof ZodUnion) {
		// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// 		return z.union((schema.options as ZodTypeAny[]).map((option) => addFieldValues(option)) as any)
		// 	} else if (schema instanceof ZodRecord) {
		// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		// 		return z.record(schema.keySchema, addFieldValues(schema.element))
		// 	} else if (schema instanceof ZodTuple) {
		// 		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		// 		return z.tuple(schema.items.map((item: ZodTypeAny) => addFieldValues(item)))
		// 	} else {
		// 		return z.union([schema, z.instanceof(FieldPath)])
		// 	}
		// }
		// // eslint-disable-next-line @typescript-eslint/no-explicit-any
		// return addFieldValues(schema as any as AnyZodObject).parse(data)
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
