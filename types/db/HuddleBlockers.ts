import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema
Timestamp

export type HuddleBlocker = {
	id: Id

	completed: boolean
	title: string
	user: {
		uid: string
		name: string
		email: string
		avatar: string
	}

	product: Id

	createdAt: Timestamp
}

export const NHuddleBlockers = {
	n: `HuddleBlockers`,
	id: {n: `id`},
	completed: {n: `completed`},
	title: {n: `title`},
	user: {
		n: `user`,
		uid: {n: `uid`},
		name: {n: `name`},
		email: {n: `email`},
		avatar: {n: `avatar`},
	},
	product: {n: `product`},
	createdAt: {n: `createdAt`},
} satisfies DbName<HuddleBlocker>

export const HuddleBlockerSchema = z.object({
	id: idSchema,

	completed: z.boolean(),
	title: z.string(),
	user: z.object({
		uid: z.string(),
		name: z.string(),
		email: z.string(),
		avatar: z.string(),
	}),

	product: idSchema,

	createdAt: z.instanceof(Timestamp),
} satisfies ZodSchema<HuddleBlocker>)

export const HuddleBlockerCollectionSchema = z.array(HuddleBlockerSchema)
