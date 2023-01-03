import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const EpicSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	priority_level: z.number(),
	visibility_level: z.number(),

	comments: z.array(idSchema),
	features: z.array(idSchema),
	keepers: z.array(idSchema),
	next_epic: idSchema.nullable(),
	prev_epic: idSchema.nullable(),
	product: idSchema,
})

export const Epics = genDbNames(`Epics`, EpicSchema)
export type Epic = z.infer<typeof EpicSchema>
