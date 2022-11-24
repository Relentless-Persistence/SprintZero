import {z, ZodTypeAny} from "zod"

export type JourneyEvents = {
	id: string

	title: string
	description: string
	start: Date
	end: Date
	isDelighted: string
	level: number
	participants: Array<{
		label: string
		checked: boolean
	}>

	journey_id: string
}

export const JourneyEventsSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	start: z.date(),
	end: z.date(),
	isDelighted: z.string(),
	level: z.number(),
	participants: z.array(
		z.object({
			label: z.string(),
			checked: z.boolean(),
		}),
	),
	journey_id: z.string(),
} satisfies {[key in keyof JourneyEvents]: ZodTypeAny})

export const JourneyEventsCollectionSchema = z.array(JourneyEventsSchema)
