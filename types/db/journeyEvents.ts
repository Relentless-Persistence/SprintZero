import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const JourneyEventSchema = z.object({
	id: idSchema,

	description: z.string(),
	end: z.date(),
	isDelighted: z.string(),
	level: z.number(),
	participants: z.array(
		z.object({
			label: z.string(),
			checked: z.boolean(),
		}),
	),
	start: z.date(),
	title: z.string(),

	journey: idSchema,
})
export const JourneyEventCollectionSchema = z.array(JourneyEventSchema)

export const JourneyEvents = genDbNames(`JourneyEvents`, JourneyEventSchema)
export type JourneyEvent = z.infer<typeof JourneyEventSchema>
