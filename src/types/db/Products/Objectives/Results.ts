// Objective results

import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const ResultSchema = z.object({
	createdAt: timestampSchema,
	text: z.string().min(1, `Required`),
})

export type Result = z.infer<typeof ResultSchema>
export const ResultConverter = genConverter(ResultSchema)
