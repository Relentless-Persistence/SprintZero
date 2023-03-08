import {z} from "zod"

import {genConverter, serverTimestampSchema} from "../../.."

export const StoryMapHistorySchema = z.object({
	future: z.boolean(),
	timestamp: serverTimestampSchema,
})

export type StoryMapHistory = z.infer<typeof StoryMapHistorySchema>
export const StoryMapHistoryConverter = genConverter(StoryMapHistorySchema)
