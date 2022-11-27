import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Team = {
	id: Id

	expiry: Date
	type: `member`
	user: {
		uid: string
		name: string
		email: string
		avatar: string
	}

	product: Id
}

export const NTeams = {
	n: `Teams`,
	id: {n: `id`},
	expiry: {n: `expiry`},
	type: {n: `type`},
	user: {
		n: `user`,
		uid: {n: `user.uid`},
		name: {n: `user.name`},
		email: {n: `user.email`},
		avatar: {n: `user.avatar`},
	},
	product: {n: `product`},
} satisfies DbName<Team>

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
} satisfies ZodSchema<Team>)

export const TeamCollectionSchema = z.array(TeamSchema)
