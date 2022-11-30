import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const FeatureSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	priority_level: z.number(),
	visibility_level: z.number(),

	comments: z.array(idSchema),
	epic: idSchema,
	next_feature: idSchema.nullable(),
	prev_feature: idSchema.nullable(),
	product: idSchema,
	stories: z.array(idSchema),
})
export const FeatureCollectionSchema = z.array(FeatureSchema)

export const Features = genDbNames(`Features`, FeatureSchema)
export type Feature = z.infer<typeof FeatureSchema>
