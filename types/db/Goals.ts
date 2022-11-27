import {z, ZodTypeAny} from "zod"

export type Goals = {
	id: string

	name: string
	description: string

	product_id: string
}

export const GoalsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	product_id: z.string(),
} satisfies {[key in keyof Goals]: ZodTypeAny})

export const GoalsCollectionSchema = z.array(GoalsSchema)
