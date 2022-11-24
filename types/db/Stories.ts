import {z, ZodTypeAny} from "zod"

export type Stories = {
	id: string

	name: string
	status: `Backlog` | `In Progress` | `Done`

	product_id: string
}

export const StoriesSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: z.union([z.literal(`Backlog`), z.literal(`In Progress`), z.literal(`Done`)]),
	product_id: z.string(),
} satisfies {[key in keyof Stories]: ZodTypeAny})

export const StoriesCollectionSchema = z.array(StoriesSchema)
