import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema
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

export const NProducts = {
	n: `Products`,
	id: {n: `id`},
	cadence: {n: `cadence`},
	cost: {n: `cost`},
	currency: {n: `currency`},
	email1: {n: `email1`},
	email2: {n: `email2`},
	email3: {n: `email3`},
	gate: {n: `gate`},
	product: {n: `product`},
	owner: {n: `owner`},
	updatedAt: {n: `updatedAt`},
} satisfies DbName<Product>

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
} satisfies ZodSchema<Product>)

export const ProductCollectionSchema = z.array(ProductSchema)
