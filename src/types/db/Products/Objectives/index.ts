import {z} from "zod"

import {genConverter} from "~/types"

export const ObjectiveSchema = z.object({
	name: z.string(),
	statement: z.string(),
})

export type Objective = z.infer<typeof ObjectiveSchema>
export const ObjectiveConverter = genConverter(ObjectiveSchema)
