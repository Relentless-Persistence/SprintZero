import {z, ZodTypeAny} from "zod"

export type Learnings = {
	id: string

	name: string
	description: string
	type: `Assumed` | `Validated`

	product_id: string
}

export const LearningsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	type: z.union([z.literal(`Assumed`), z.literal(`Validated`)]),
	product_id: z.string(),
} satisfies {[key in keyof Learnings]: ZodTypeAny})

export const LearningsCollectionSchema = z.array(LearningsSchema)
