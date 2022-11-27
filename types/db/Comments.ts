import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type Comment = {
	id: Id

	author: string
	text: string

	createdAt: Timestamp
}

export const CommentSchema = z.object({
	id: idSchema,

	author: z.string(),
	text: z.string(),

	createdAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Comment]: ZodTypeAny})

export const CommentCollectionSchema = z.array(CommentSchema)
