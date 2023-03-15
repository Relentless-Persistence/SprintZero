import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const MarketLeaderSchema = z.object({
	createdAt: timestampSchema,
	text: z.string(),
})

export type MarketLeader = z.infer<typeof MarketLeaderSchema>
export const MarketLeaderConverter = genConverter(MarketLeaderSchema)
