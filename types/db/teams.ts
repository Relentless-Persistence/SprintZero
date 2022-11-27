import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

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
} satisfies {[key in keyof Team]: ZodTypeAny})

export const TeamCollectionSchema = z.array(TeamSchema)
