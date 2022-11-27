import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type Product = {
	id: Id

	cadence: string
	cost: number | null
	currency: string
	email1: string
	email2: string
	email3: string
	gate: `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday` | `Sunday`
	product: string

	owner: Id

	updatedAt: Timestamp
}

export const ProductSchema = z.object({
	id: idSchema,

	cadence: z.string(),
	cost: z.number().nullable(),
	currency: z.string(),
	email1: z.string(),
	email2: z.string(),
	email3: z.string(),
	gate: z.union([
		z.literal(`Monday`),
		z.literal(`Tuesday`),
		z.literal(`Wednesday`),
		z.literal(`Thursday`),
		z.literal(`Friday`),
		z.literal(`Saturday`),
		z.literal(`Sunday`),
	]),
	product: z.string(),

	owner: idSchema,

	updatedAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Product]: ZodTypeAny})

export const ProductCollectionSchema = z.array(ProductSchema)
