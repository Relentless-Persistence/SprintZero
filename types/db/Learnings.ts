import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const LearningSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	type: z.union([z.literal(`Assumed`), z.literal(`Validated`)]),

	product: idSchema,
})

export const Learnings = genDbNames(`Learnings`, LearningSchema)
export type Learning = z.infer<typeof LearningSchema>
