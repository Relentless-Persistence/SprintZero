import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const FeatureSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	comments: z.array(idSchema),
	stories: z.array(idSchema),

	product: idSchema,
	epic: idSchema,
})
export const FeatureCollectionSchema = z.array(FeatureSchema)

export const Features = genDbNames(`Features`, FeatureSchema)
export type Feature = z.infer<typeof FeatureSchema>
