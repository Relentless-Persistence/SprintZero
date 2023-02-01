import {z} from "zod"

import type {FirestoreDataConverter, DocumentReference} from "firebase/firestore"
import type {Schema} from "type-fest"
import type {AnyZodObject, ZodSchema, ZodTypeDef} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

export const genDbNames = <T extends AnyZodObject>(
	collectionName: string,
	schema: T,
): Schema<z.infer<T>, string> & {_: string} => {
	const dbNames = new Proxy(
		{},
		{
			get(target, property) {
				if (property === `_`) return collectionName
				if (!(property in schema.shape) || typeof property !== `string`) return undefined
				const value = schema.shape[property]

				if (value instanceof z.ZodArray && value._def.type instanceof z.ZodObject)
					return genDbNames(property, value._def.type)

				if (value instanceof z.ZodObject) return genDbNames(property, value)

				return property
			},
		},
	)
	return dbNames as any
}

export type WithDocumentData<T> = T & {
	id: Id
	ref: DocumentReference<T>
}

export const genConverter = <T extends Record<string, any>>(
	schema: ZodSchema<T, ZodTypeDef, unknown>,
): FirestoreDataConverter<WithDocumentData<T>> => ({
	toFirestore: (data) => schema.parse(data),
	fromFirestore: (snap) => ({
		...schema.parse(snap.data()),
		id: snap.id as Id,
		ref: snap.ref as DocumentReference<T>,
	}),
})
