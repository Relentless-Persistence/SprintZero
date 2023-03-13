import {z} from "zod"

import {genConverter} from "~/types"

export const OldJourneySchema = z.object({
	duration: z.number(),
	durationUnit: z.enum([`minutes`, `hours`, `days`, `weeks`, `months`, `years`]),
	name: z.string(),

	productId: z.string(),
})

export type Journey = z.infer<typeof OldJourneySchema>
export const JourneyConverter = genConverter(OldJourneySchema)

export const durationUnits = {
	minutes: `Minute`,
	hours: `Hour`,
	days: `Day`,
	weeks: `Week`,
	months: `Month`,
	years: `Year`,
} as const
