import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const CommentSchema = z.object({
	text: z.string(),
	type: z.enum([`design`, `code`]),

	authorId: idSchema,
	parentId: z.string(),
})

export type Comment = z.infer<typeof CommentSchema>
export const CommentConverter = genConverter(CommentSchema)
