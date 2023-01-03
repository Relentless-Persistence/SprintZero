import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const JourneySchema = z.object({
	id: idSchema,

	duration: z.string(),
	durationType: z.string(),
	name: z.string(),
	start: z.string(),

	product: idSchema,
})

export const Journeys = genDbNames(`Journeys`, JourneySchema)
export type Journey = z.infer<typeof JourneySchema>
