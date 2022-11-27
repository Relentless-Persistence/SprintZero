import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type InviteToken = {
	id: Id

	token: string
	type: `viewer` | `member`

	product: Id
}

export const InviteTokenSchema = z.object({
	id: idSchema,

	token: z.string(),
	type: z.union([z.literal(`viewer`), z.literal(`member`)]),

	product: idSchema,
} satisfies {[key in keyof InviteToken]: ZodTypeAny})

export const InviteTokenCollectionSchema = z.array(InviteTokenSchema)
