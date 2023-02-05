import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const JourneyEventSchema = z.object({
	description: z.string(),
	emotion: z.enum([`frustrated`, `delighted`]),
	emotionLevel: z.number().int().min(0).max(100),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	title: z.string(),

	productId: idSchema,
})

export const JourneyEvents = genDbNames(`Journeys`, JourneyEventSchema)
export type JourneyEvent = z.infer<typeof JourneyEventSchema>
export const JourneyEventConverter = genConverter(JourneyEventSchema)
