import {z} from "zod"

import {genConverter} from "~/types"

export const OldObjectiveSchema = z.object({
	name: z.string(),
	statement: z.string(),

	productId: z.string(),
})

export type Objective = z.infer<typeof OldObjectiveSchema>
export const ObjectiveConverter = genConverter(OldObjectiveSchema)
