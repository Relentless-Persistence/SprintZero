import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const SprintSchema = z.object({
	id: idSchema,

	endDate: z.date(),
	name: z.string(),
	startDate: z.date(),

	product: idSchema,
})
export const SprintCollectionSchema = z.array(SprintSchema)

export const Sprints = genDbNames(`Sprints`, SprintSchema)
export type Sprint = z.infer<typeof SprintSchema>
