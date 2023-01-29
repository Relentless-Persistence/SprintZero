import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

const EpicSchema = z.object({
	id: idSchema,

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	commentIds: z.array(idSchema),
	featureIds: z.array(idSchema),
	keeperIds: z.array(idSchema),
	nameInputStateId: idSchema,
})
export type Epic = z.infer<typeof EpicSchema>

const FeatureSchema = z.object({
	id: idSchema,

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	commentIds: z.array(idSchema),
	nameInputStateId: idSchema,
	storyIds: z.array(idSchema),
})
export type Feature = z.infer<typeof FeatureSchema>

const StorySchema = z.object({
	id: idSchema,

	acceptanceCriteria: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	branchName: z.string().nullable(),
	description: z.string(),
	designLink: z.string().url().nullable(),
	ethicsApproved: z.boolean().nullable(),
	ethicsColumn: z.union([z.literal(`identified`), z.literal(`under-review`), z.literal(`adjudicated`)]).nullable(),
	ethicsVotes: z.array(
		z.object({
			userId: idSchema,
			vote: z.boolean(),
		}),
	),
	name: z.string(),
	pageLink: z.string().url().nullable(),
	points: z.number(),

	commentIds: z.array(idSchema),
	nameInputStateId: idSchema,
	versionId: idSchema,
})
export type Story = z.infer<typeof StorySchema>

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
			userId: idSchema,
			type: z.union([z.literal(`editor`), z.literal(`viewer`)]),
		}),
	),
	name: z.string(),
	storyMapState: z.object({
		epics: z.array(EpicSchema),
		features: z.array(FeatureSchema),
		stories: z.array(StorySchema),

		productId: idSchema,
	}),
})

export const Products = genDbNames(`Products`, ProductSchema)
export type Product = z.infer<typeof ProductSchema>
export type StoryMapState = Product[`storyMapState`]
