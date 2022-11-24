import {z, ZodTypeAny} from "zod"

export type Kickoff = {
	id: string

	priorities: string[]
	problem_statement: string
	success_metrics: string[]

	product_id: string
}

export const KickoffSchema = z.object({
	id: z.string(),
	priorities: z.array(z.string()),
	problem_statement: z.string(),
	success_metrics: z.array(z.string()),
	product_id: z.string(),
} satisfies {[key in keyof Kickoff]: ZodTypeAny})

export const KickoffCollectionSchema = z.array(KickoffSchema)
