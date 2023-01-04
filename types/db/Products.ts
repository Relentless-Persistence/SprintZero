import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const ProductSchema = z.object({
	id: idSchema,
	cadence: z.number(),
	effortCost: z.number().nullable(),
	email1: z.string().nullable(),
	email2: z.string().nullable(),
	email3: z.string().nullable(),
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
})

export const Products = genDbNames(`Products`, ProductSchema)
export type Product = z.infer<typeof ProductSchema>
