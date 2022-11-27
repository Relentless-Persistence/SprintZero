import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Huddle = {
	id: Id

	completed: boolean
	title: string

	product: Id
	user: Id

	createdAt: Timestamp
}

export const HuddlesSchema = z.object({
	id: idSchema,

	completed: z.boolean(),
	title: z.string(),

	product: idSchema,
	user: idSchema,

	createdAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Huddle]: ZodTypeAny})

export const HuddlesCollectionSchema = z.array(HuddlesSchema)
