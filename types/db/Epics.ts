import {z, ZodTypeAny} from "zod"

export type Epics = {
	id: string

	name: string
	features: Array<{
		id: string
		name: string
		priority_level: number
		feasibility_level: number
		status: string
		stories: Array<{
			id: string
			name: string
			description: string
			status: string
			effort: string
			priority_level: number
			feasibility_level: number
			flagged: boolean
			ethics_status: string
			ethics_votes: {}[]
			acceptance_criteria: {}[]
			accepts: number
			rejects: number
			code_link: string
			design_link: string
			sprint_status: string

			sprint_id: string
			version: string
		}>
	}>

	product_id: string
	version: string
}

export const EpicsSchema = z.object({
	id: z.string(),
	name: z.string(),
	features: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			priority_level: z.number(),
			feasibility_level: z.number(),
			status: z.string(),
			stories: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					description: z.string(),
					status: z.string(),
					effort: z.string(),
					priority_level: z.number(),
					feasibility_level: z.number(),
					flagged: z.boolean(),
					ethics_status: z.string(),
					ethics_votes: z.array(z.object({})),
					acceptance_criteria: z.array(z.object({})),
					accepts: z.number(),
					rejects: z.number(),
					code_link: z.string(),
					design_link: z.string(),
					sprint_status: z.string(),
					sprint_id: z.string(),
					version: z.string(),
				}),
			),
		}),
	),
	product_id: z.string(),
	version: z.string(),
} satisfies {[key in keyof Epics]: ZodTypeAny})

export const EpicsCollectionSchema = z.array(EpicsSchema)
