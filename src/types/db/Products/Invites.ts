import {z} from "zod"

import {genConverter} from "~/types"

export const InviteSchema = z.object({
	email: z.string(),
})

export type Invite = z.infer<typeof InviteSchema>
export const InviteConverter = genConverter(InviteSchema)
