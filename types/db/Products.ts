import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const ProductSchema = z.object({
	id: idSchema,
	cadence: z.string(),
	cost: z.number().nullable(),
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
	name: z.string(),

	owner: idSchema,
	members: z.array(idSchema).default([]),

	updatedAt: z.instanceof(Timestamp),
})

export const Products = genDbNames(`Products`, ProductSchema)
export type Product = z.infer<typeof ProductSchema>
