import {z} from "zod"

import {genConverter} from "~/types"

export const OldInsightSchema = z.object({
	status: z.enum([`validated`, `assumed`, `disproven`]),
	text: z.string(),
	title: z.string(),

	productId: z.string(),
})

export type Insight = z.infer<typeof OldInsightSchema>
export const InsightConverter = genConverter(OldInsightSchema)
