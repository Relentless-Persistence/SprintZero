import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const InsightSchema = z.object({
	status: z.enum([`validated`, `assumed`, `disproven`]),
	text: z.string(),
	title: z.string(),

	productId: idSchema,
})

export type Insight = z.infer<typeof InsightSchema>
export const InsightConverter = genConverter(InsightSchema)
