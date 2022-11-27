import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema
Timestamp

export type Comment = {
	id: Id

	author: string
	text: string

	createdAt: Timestamp
}

export const NComments = {
	n: `Comments`,
	id: {n: `id`},
	author: {n: `author`},
	text: {n: `text`},
	createdAt: {n: `createdAt`},
} satisfies DbName<Comment>

export const CommentSchema = z.object({
	id: idSchema,

	author: z.string(),
	text: z.string(),

	createdAt: z.instanceof(Timestamp),
} satisfies ZodSchema<Comment>)

export const CommentCollectionSchema = z.array(CommentSchema)
