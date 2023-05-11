import {z} from "zod"

import {genConverter, serverTimestampSchema} from "~/types"

export const CommentSchema = z.object({
	createdAt: serverTimestampSchema,
	text: z.string(),
	type: z.enum([`design`, `engineering`]),

	authorId: z.string(),
})

export type Comment = z.infer<typeof CommentSchema>
export const CommentConverter = genConverter(CommentSchema)
