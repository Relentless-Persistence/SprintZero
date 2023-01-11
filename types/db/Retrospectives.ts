import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const RetrospectiveSchema = z.object({
	id: idSchema,

	description: z.string(),
	title: z.string(),
	type: z.union([z.literal(`Enjoyable`), z.literal(`Puzzling`)]),
	user: z.object({
		id: z.string(),
		name: z.string(),
		photo: z.string(),
	}),

	product: idSchema,
})

export const Retrospectives = genDbNames(`Retrospectives`, RetrospectiveSchema)
export type Retrospective = z.infer<typeof RetrospectiveSchema>
