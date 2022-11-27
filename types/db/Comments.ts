import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type Comments = {
	id: string

	author: string
	text: string

	createdAt: Timestamp
}

export const CommentsSchema = z.object({
	id: z.string(),
	author: z.string(),
	text: z.string(),
	createdAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Comments]: ZodTypeAny})

export const CommentsCollectionSchema = z.array(CommentsSchema)
