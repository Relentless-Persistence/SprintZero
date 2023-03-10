import {z} from "zod"

import {genConverter} from "~/types"

export const FeatureSchema = z.object({
	text: z.string(),
})

export type Feature = z.infer<typeof FeatureSchema>
export const FeatureConverter = genConverter(FeatureSchema)
