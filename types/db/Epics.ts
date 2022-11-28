import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const EpicSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	comments: z.array(idSchema),
	features: z.array(idSchema),
	keepers: z.array(idSchema),
	nextEpic: idSchema.nullable(),
	prevEpic: idSchema.nullable(),
	product: idSchema,
})
export const EpicCollectionSchema = z.array(EpicSchema)

export const Epics = genDbNames(`Epics`, EpicSchema)
export type Epic = z.infer<typeof EpicSchema>
