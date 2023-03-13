// Objective results

import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const OldResultSchema = z.object({
	createdAt: timestampSchema,
	text: z.string().min(1, `Required`),
})

export type Result = z.infer<typeof OldResultSchema>
export const ResultConverter = genConverter(OldResultSchema)
