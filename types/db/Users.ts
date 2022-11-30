import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const UserSchema = z.object({
	id: idSchema,

	name: z.string(),
	email: z.string(),
})
export const UserCollectionSchema = z.array(UserSchema)

export const Users = genDbNames(`Users`, UserSchema)
export type User = z.infer<typeof UserSchema>
