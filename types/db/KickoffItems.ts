import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const KickoffItemSchema = z.object({
	id: idSchema,

	priorities: z.array(z.string()),
	problemStatement: z.string(),
	successMetrics: z.array(z.string()),

	product: idSchema,
})
export const KickoffItemCollectionSchema = z.array(KickoffItemSchema)

export const KickoffItems = genDbNames(`KickoffItems`, KickoffItemSchema)
export type KickoffItem = z.infer<typeof KickoffItemSchema>
