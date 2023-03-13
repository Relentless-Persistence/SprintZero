import {z} from "zod"

import {genConverter, serverTimestampSchema} from "~/types"

export const OldCommentSchema = z.object({
	createdAt: serverTimestampSchema,
	text: z.string(),
	type: z.enum([`design`, `code`]),

	authorId: z.string(),
	parentId: z.string(),
})

export type Comment = z.infer<typeof OldCommentSchema>
export const CommentConverter = genConverter(OldCommentSchema)
