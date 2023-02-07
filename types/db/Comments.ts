import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const CommentSchema = z.object({
	text: z.string(),
	type: z.enum([`design`, `code`]),

	authorId: idSchema,
	parentId: z.string(),
})

export const Comments = genDbNames(`Comments`, CommentSchema)
export type Comment = z.infer<typeof CommentSchema>
export const CommentConverter = genConverter(CommentSchema)
