import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const PotentialRiskSchema = z.object({
	createdAt: timestampSchema,
	text: z.string(),
})

export type PotentialRisk = z.infer<typeof PotentialRiskSchema>
export const PotentialRiskConverter = genConverter(PotentialRiskSchema)
