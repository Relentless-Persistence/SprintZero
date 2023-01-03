import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const TeamSchema = z.object({
	id: idSchema,

	expiry: z.date(),
	type: z.literal(`member`),
	user: z.object({
		uid: z.string(),
		name: z.string(),
		email: z.string(),
		avatar: z.string(),
	}),

	product: idSchema,
})

export const Teams = genDbNames(`Teams`, TeamSchema)
export type Team = z.infer<typeof TeamSchema>
