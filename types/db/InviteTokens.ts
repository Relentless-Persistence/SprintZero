import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const InviteTokenSchema = z.object({
	id: idSchema,

	token: z.string(),
	type: z.union([z.literal(`viewer`), z.literal(`member`)]),

	product: idSchema,
})
export const InviteTokenCollectionSchema = z.array(InviteTokenSchema)

export const InviteTokens = genDbNames(`InviteTokens`, InviteTokenSchema)
export type InviteToken = z.infer<typeof InviteTokenSchema>
