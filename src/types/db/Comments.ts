import {z} from "zod"

import {genConverter, idSchema, serverTimestampSchema} from "~/types"

export const CommentSchema = z.object({
	createdAt: serverTimestampSchema,
	text: z.string(),
	type: z.enum([`design`, `code`]),

	authorId: idSchema,
	parentId: idSchema,
})

export type Comment = z.infer<typeof CommentSchema>
export const CommentConverter = genConverter(CommentSchema)
