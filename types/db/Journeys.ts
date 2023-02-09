import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const JourneySchema = z.object({
	duration: z.number(),
	durationUnit: z.enum([`minutes`, `hours`, `days`, `weeks`, `months`, `years`]),
	name: z.string(),

	productId: idSchema,
})

export type Journey = z.infer<typeof JourneySchema>
export const JourneyConverter = genConverter(JourneySchema)

export const durationUnits = {
	minutes: `Minute`,
	hours: `Hour`,
	days: `Day`,
	weeks: `Week`,
	months: `Month`,
	years: `Year`,
} as const
