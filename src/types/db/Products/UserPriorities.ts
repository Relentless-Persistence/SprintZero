import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const UserPrioritySchema = z.object({
	createdAt: timestampSchema,
	text: z.string(),
})

export type UserPriority = z.infer<typeof UserPrioritySchema>
export const UserPriorityConverter = genConverter(UserPrioritySchema)
