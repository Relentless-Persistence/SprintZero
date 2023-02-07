import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const LearningSchema = z.object({
	status: z.enum([`validated`, `assumed`, `disproven`]),
	text: z.string(),
	title: z.string(),

	productId: idSchema,
})

export const Learnings = genDbNames(`Learnings`, LearningSchema)
export type Learning = z.infer<typeof LearningSchema>
export const LearningConverter = genConverter(LearningSchema)
