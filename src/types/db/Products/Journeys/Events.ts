import {z} from "zod"

import {genConverter} from "~/types"

export const EventSchema = z.object({
	description: z.string(),
	emotion: z.enum([`frustrated`, `delighted`]),
	emotionLevel: z.number().int().min(0).max(100),
	end: z.number(),
	start: z.number(),
	subject: z.string(),

	personaIds: z.array(z.string()).default([]),
})

export type Event = z.infer<typeof EventSchema>
export const EventConverter = genConverter(EventSchema)
