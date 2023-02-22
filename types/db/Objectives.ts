import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const ObjectiveSchema = z.object({
	name: z.string(),
	statement: z.string(),

	productId: idSchema,
})

export type Objective = z.infer<typeof ObjectiveSchema>
export const ObjectiveConverter = genConverter(ObjectiveSchema)
