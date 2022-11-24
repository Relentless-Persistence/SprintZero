import {z, ZodTypeAny} from "zod"

export type Sprints = {
	id: string

	name: string
	startDate: Date
	endDate: Date

	product_id: string
}

export const SprintsSchema = z.object({
	id: z.string(),
	name: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	product_id: z.string(),
} satisfies {[key in keyof Sprints]: ZodTypeAny})

export const SprintsCollectionSchema = z.array(SprintsSchema)
