import {z} from "zod"

import {genConverter} from "~/types"

export const PrioritySchema = z.object({
	text: z.string(),
})

export type Priority = z.infer<typeof PrioritySchema>
export const PriorityConverter = genConverter(PrioritySchema)
