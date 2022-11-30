import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const FeatureSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	comments: z.array(idSchema),
	epic: idSchema,
	nextFeature: idSchema.nullable(),
	prevFeature: idSchema.nullable(),
	product: idSchema,
	stories: z.array(idSchema),
})
export const FeatureCollectionSchema = z.array(FeatureSchema)

export const Features = genDbNames(`Features`, FeatureSchema)
export type Feature = z.infer<typeof FeatureSchema>
