import {z} from "zod"

import {genConverter} from "~/types"

export const UserPrioritySchema = z.object({
	text: z.string(),
})

export type UserPriority = z.infer<typeof UserPrioritySchema>
export const UserPriorityConverter = genConverter(UserPrioritySchema)
