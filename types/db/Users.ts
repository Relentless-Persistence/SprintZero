import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const UserSchema = z.object({
	id: idSchema,

	avatar: z.string().nullable(),
	email: z.string(),
	name: z.string(),
})

export const Users = genDbNames(`Users`, UserSchema)
export type User = z.infer<typeof UserSchema>
