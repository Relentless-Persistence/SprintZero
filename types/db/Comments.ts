import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const CommentSchema = z.object({
	id: idSchema,

	author: z.string(),
	text: z.string(),

	createdAt: z.instanceof(Timestamp),
})
export const CommentCollectionSchema = z.array(CommentSchema)

export const Comments = genDbNames(`Comments`, CommentSchema)
export type Comment = z.infer<typeof CommentSchema>