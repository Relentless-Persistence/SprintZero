import {z} from "zod"

import {genConverter} from "~/types"

export const UserSchema = z.object({
	avatar: z.string().nullable(),
	email: z.string(),
	hasAcceptedTos: z.boolean(),
	name: z.string(),
})

export type User = z.infer<typeof UserSchema>
export const UserConverter = genConverter(UserSchema)
