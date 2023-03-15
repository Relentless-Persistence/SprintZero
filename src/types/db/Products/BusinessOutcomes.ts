import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const BusinessOutcomeSchema = z.object({
	createdAt: timestampSchema,
	text: z.string(),
})

export type BusinessOutcome = z.infer<typeof BusinessOutcomeSchema>
export const BusinessOutcomeConverter = genConverter(BusinessOutcomeSchema)
