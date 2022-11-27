import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Huddle = {
	id: Id

	completed: boolean
	title: string

	product: Id
	user: Id

	createdAt: Timestamp
}

export const NHuddles = {
	n: `Huddles`,
	id: {n: `id`},
	completed: {n: `completed`},
	title: {n: `title`},
	product: {n: `product`},
	user: {n: `user`},
	createdAt: {n: `createdAt`},
} satisfies DbName<Huddle>

export const HuddlesSchema = z.object({
	id: idSchema,

	completed: z.boolean(),
	title: z.string(),

	product: idSchema,
	user: idSchema,

	createdAt: z.instanceof(Timestamp),
} satisfies ZodSchema<Huddle>)

export const HuddlesCollectionSchema = z.array(HuddlesSchema)
