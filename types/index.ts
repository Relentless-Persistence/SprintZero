import {z} from "zod"

import type {Timestamp} from "firebase9/firestore"
import type {ZodTypeAny, ZodArray, ZodObject} from "zod"

export const idSchema = z.string().brand<`Id`>()
export type Id = z.infer<typeof idSchema>

type Primitives = string | number | boolean | Date | Id | Timestamp

export type DbName<T> = {n: string} & {
	[key in keyof T]: T[key] extends Primitives | Primitives[]
		? {n: string}
		: T[key] extends Array<Record<string, any>>
		? DbName<T[key][number]>
		: T[key] extends Record<string, any>
		? DbName<T[key]>
		: {n: string}
}

export type ZodSchema<T> = {
	[key1 in keyof T]: T[key1] extends Primitives | Primitives[]
		? ZodTypeAny
		: T[key1] extends Array<Record<string, any>>
		? ZodArray<ZodObject<{[key2 in keyof T[key1][number]]: ZodTypeAny}>>
		: T[key1] extends Record<string, any>
		? ZodObject<{[key2 in keyof T[key1]]: ZodTypeAny}>
		: ZodTypeAny
}
