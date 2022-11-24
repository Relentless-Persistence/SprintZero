import {z, ZodTypeAny} from "zod"

export type Personas = {
	id: string

	changes: string[]
	dailyLife: string[]
	frustrations: string[]
	goals: string[]
	interactions: string[]
	priorities: string[]
	responsibilities: string[]
	role: string
	tasks: string[]

	product_id: string
}

export const PersonasSchema = z.object({
	id: z.string(),
	changes: z.array(z.string()),
	dailyLife: z.array(z.string()),
	frustrations: z.array(z.string()),
	goals: z.array(z.string()),
	interactions: z.array(z.string()),
	priorities: z.array(z.string()),
	responsibilities: z.array(z.string()),
	role: z.string(),
	tasks: z.array(z.string()),
	product_id: z.string(),
} satisfies {[key in keyof Personas]: ZodTypeAny})

export const PersonasCollectionSchema = z.array(PersonasSchema)
