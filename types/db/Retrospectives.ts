import {z, ZodTypeAny} from "zod"

export type Retrospectives = {
	id: string

	title: string
	description: string
	type: `Enjoyable` | `Puzzling`
	user: {
		id: string
		name: string
		photo: string
	}

	product_id: string
}

export const RetrospectivesSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	type: z.union([z.literal(`Enjoyable`), z.literal(`Puzzling`)]),
	user: z.object({
		id: z.string(),
		name: z.string(),
		photo: z.string(),
	}),
	product_id: z.string(),
} satisfies {[key in keyof Retrospectives]: ZodTypeAny})

export const RetrospectivesCollectionSchema = z.array(RetrospectivesSchema)
