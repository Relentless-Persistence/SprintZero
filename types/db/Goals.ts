import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const GoalSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	product: idSchema,
})
export const GoalCollectionSchema = z.array(GoalSchema)

export const Goals = genDbNames(`Goals`, GoalSchema)
export type Goal = z.infer<typeof GoalSchema>
