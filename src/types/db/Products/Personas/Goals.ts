import {z} from "zod"

import {genConverter} from "~/types"

export const GoalSchema = z.object({
	text: z.string(),
})

export type Goal = z.infer<typeof GoalSchema>
export const GoalConverter = genConverter(GoalSchema)
