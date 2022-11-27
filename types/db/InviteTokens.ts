import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type InviteToken = {
	id: Id

	token: string
	type: `viewer` | `member`

	product: Id
}

export const NInviteTokens = {
	n: `InviteTokens`,
	id: {n: `id`},
	token: {n: `token`},
	type: {n: `type`},
	product: {n: `product`},
} satisfies DbName<InviteToken>

export const InviteTokenSchema = z.object({
	id: idSchema,

	token: z.string(),
	type: z.union([z.literal(`viewer`), z.literal(`member`)]),

	product: idSchema,
} satisfies ZodSchema<InviteToken>)

export const InviteTokenCollectionSchema = z.array(InviteTokenSchema)
