import {z, ZodTypeAny} from "zod"

export type Result = {
	id: string

	description: string
	goal_id: string
}

export const ResultSchema = z.object({
	id: z.string(),
	description: z.string(),
	goal_id: z.string(),
} satisfies {[key in keyof Result]: ZodTypeAny})

export const ResultCollectionSchema = z.array(ResultSchema)
