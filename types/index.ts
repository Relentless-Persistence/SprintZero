import {z} from "zod"

import type {Timestamp} from "firebase9/firestore"
import type {ZodTypeAny, ZodObject, ZodArray} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

type Primitives = string | number | boolean | Date | Id | Timestamp

export type DbName<T extends Record<string, any>> = {_: string} & {
	[key in keyof T]: T[key] extends Primitives | Primitives[]
		? string
		: T[key] extends Array<Record<string, any>>
		? DbName<T[key][number]>
		: T[key] extends Record<string, any>
		? DbName<T[key]>
		: string
}

export type ZodSchema<T> = ZodObject<{
	[key1 in keyof T]: T[key1] extends Primitives | Primitives[]
		? ZodTypeAny
		: T[key1] extends Array<Record<string, any>>
		? ZodArray<ZodObject<{[key2 in keyof T[key1][number]]: ZodTypeAny}>>
		: T[key1] extends Record<string, any>
		? ZodObject<{[key2 in keyof T[key1]]: ZodTypeAny}>
		: ZodTypeAny
}>

export const genDbNames = <T extends Record<string, any>>(collectionName: string, schema: ZodSchema<T>): DbName<T> => {
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
	return dbNames as DbName<T>
}
