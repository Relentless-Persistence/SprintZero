import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const CommentSchema = z.object({
	id: idSchema,

	text: z.string(),
	type: z.union([z.literal(`design`), z.literal(`code`)]),

	authorId: idSchema,
})

export const Comments = genDbNames(`Comments`, CommentSchema)
export type Comment = z.infer<typeof CommentSchema>
