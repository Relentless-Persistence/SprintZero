import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const ProductSchema = z.object({
	id: idSchema,

	cadence: z.number(),
	effortCost: z.number().nullable(),
	gate: z.union([
		z.literal(`Monday`),
		z.literal(`Tuesday`),
		z.literal(`Wednesday`),
		z.literal(`Thursday`),
		z.literal(`Friday`),
		z.literal(`Saturday`),
		z.literal(`Sunday`),
	]),
	members: z.array(
		z.object({
			user: idSchema,
			type: z.union([z.literal(`editor`), z.literal(`viewer`)]),
		}),
	),
	name: z.string(),
	storyMapState: z.array(
		z.object({
			epic: idSchema,
			featuresOrder: z.array(
				z.object({
					feature: idSchema,
					storiesOrder: z.array(
						z.object({
							story: idSchema,
						}),
					),
				}),
			),
		}),
	),
})

export const Products = genDbNames(`Products`, ProductSchema)
export type Product = z.infer<typeof ProductSchema>
