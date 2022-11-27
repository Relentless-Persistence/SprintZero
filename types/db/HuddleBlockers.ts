import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
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
} satisfies {[key in keyof HuddleBlocker]: ZodTypeAny})

export const HuddleBlockerCollectionSchema = z.array(HuddleBlockerSchema)
