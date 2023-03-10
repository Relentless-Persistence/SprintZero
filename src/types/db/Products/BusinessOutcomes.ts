import {z} from "zod"

import {genConverter} from "~/types"

export const BusinessOutcomeSchema = z.object({
	text: z.string(),
})

export type BusinessOutcome = z.infer<typeof BusinessOutcomeSchema>
export const BusinessOutcomeConverter = genConverter(BusinessOutcomeSchema)
