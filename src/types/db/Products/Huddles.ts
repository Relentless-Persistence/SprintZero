import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const HuddleSchema = z.object({
	updatedAt: timestampSchema,

	blockerStoryIds: z.array(z.string()),
	todayStoryIds: z.array(z.string()),
	yesterdayStoryIds: z.array(z.string()),
})

export type Huddle = z.infer<typeof HuddleSchema>
export const HuddleConverter = genConverter(HuddleSchema)
