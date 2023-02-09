import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const LearningSchema = z.object({
	status: z.enum([`validated`, `assumed`, `disproven`]),
	text: z.string(),
	title: z.string(),

	productId: idSchema,
})

export type Learning = z.infer<typeof LearningSchema>
export const LearningConverter = genConverter(LearningSchema)
