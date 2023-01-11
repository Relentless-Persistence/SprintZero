import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const ResultSchema = z.object({
	id: idSchema,

	description: z.string(),

	goal: idSchema,
})

export const Results = genDbNames(`Results`, ResultSchema)
export type Result = z.infer<typeof ResultSchema>
