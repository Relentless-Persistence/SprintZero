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
			id: idSchema,

			description: z.string(),
			name: z.string(),
			priority_level: z.number(),
			visibility_level: z.number(),

			comments: z.array(idSchema),
			keepers: z.array(idSchema),
			nameInputStateId: idSchema,

			features: z.array(
				z.object({
					id: idSchema,

					description: z.string(),
					name: z.string(),
					priority_level: z.number(),
					visibility_level: z.number(),

					comments: z.array(idSchema),
					nameInputState: idSchema,

					stories: z.array(
						z.object({
							id: idSchema,

							acceptanceCriteria: z.array(
								z.object({
									id: z.string(),
									name: z.string(),
									checked: z.boolean(),
								}),
							),
							codeLink: z.string().url().nullable(),
							description: z.string(),
							designLink: z.string().url().nullable(),
							name: z.string(),
							points: z.number(),
							priority_level: z.number(),
							visibility_level: z.number(),

							comments: z.array(idSchema),
							nameInputState: idSchema,
							version: idSchema,
						}),
					),
				}),
			),
		}),
	),
})

export const Products = genDbNames(`Products`, ProductSchema)
export type Product = z.infer<typeof ProductSchema>
export type StoryMapState = Product[`storyMapState`]
export type Epic = StoryMapState[number]
export type Feature = Epic[`features`][number]
export type Story = Feature[`stories`][number]
