import {z} from "zod"

import {genConverter} from "~/types"

export const PotentialRiskSchema = z.object({
	text: z.string(),
})

export type PotentialRisk = z.infer<typeof PotentialRiskSchema>
export const PotentialRiskConverter = genConverter(PotentialRiskSchema)
