import {z, ZodTypeAny} from "zod"

export type Journeys = {
	id: string

	name: string
	start: string
	duration: string
	durationType: string

	product_id: string
}

export const JourneysSchema = z.object({
	id: z.string(),
	name: z.string(),
	start: z.string(),
	duration: z.string(),
	durationType: z.string(),
	product_id: z.string(),
} satisfies {[key in keyof Journeys]: ZodTypeAny})

export const JourneysCollectionSchema = z.array(JourneysSchema)
