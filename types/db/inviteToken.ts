import {z, ZodTypeAny} from "zod"

export type InviteToken = {
	id: string

	token: string
	type: `viewer` | `member`

	product_id: string
}

export const InviteTokenSchema = z.object({
	id: z.string(),
	token: z.string(),
	type: z.union([z.literal(`viewer`), z.literal(`member`)]),
	product_id: z.string(),
} satisfies {[key in keyof InviteToken]: ZodTypeAny})

export const InviteTokenCollectionSchema = z.array(InviteTokenSchema)
