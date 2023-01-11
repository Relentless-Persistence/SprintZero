import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const EthicsItemSchema = z.object({
	id: idSchema,

	type: z.string(),

	story: idSchema,
})

export const EthicsItems = genDbNames(`EthicsItems`, EthicsItemSchema)
export type EthicsItem = z.infer<typeof EthicsItemSchema>
