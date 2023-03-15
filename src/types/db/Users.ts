import {z} from "zod"

import {genConverter} from ".."

export const UserSchema = z.object({
	email: z.string(),
	hasAcceptedTos: z.boolean(),
	preferredMusicClient: z.enum([`appleMusic`, `spotify`]).default(`appleMusic`),
	type: z.enum([`admin`, `user`]).default(`user`),
})

export type User = z.infer<typeof UserSchema>
export const UserConverter = genConverter(UserSchema)
