import {z, ZodTypeAny} from "zod"

export type StoriesComments = {
	id: string

	author: {
		name: string
		avatar: string
	}
	comment: string
	type: `code` | `design`

	story_id: string
	createdAt: Date
}

export const StoriesCommentsSchema = z.object({
	id: z.string(),
	author: z.object({
		name: z.string(),
		avatar: z.string(),
	}),
	comment: z.string(),
	type: z.union([z.literal(`code`), z.literal(`design`)]),
	story_id: z.string(),
	createdAt: z.date(),
} satisfies {[key in keyof StoriesComments]: ZodTypeAny})

export const StoriesCommentsCollectionSchema = z.array(StoriesCommentsSchema)
