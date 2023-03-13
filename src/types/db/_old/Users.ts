import {z} from "zod"

import {genConverter} from "~/types"

export const OldUserSchema = z.object({
	avatar: z.string().nullable(),
	email: z.string(),
	hasAcceptedTos: z.boolean(),
	name: z.string(),
})

export type User = z.infer<typeof OldUserSchema>
export const UserConverter = genConverter(OldUserSchema)
