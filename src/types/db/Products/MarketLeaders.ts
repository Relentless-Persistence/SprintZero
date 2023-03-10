import {z} from "zod"

import {genConverter} from "~/types"

export const MarketLeaderSchema = z.object({
	text: z.string(),
})

export type MarketLeader = z.infer<typeof MarketLeaderSchema>
export const MarketLeaderConverter = genConverter(MarketLeaderSchema)
