import {z} from "zod"

import {genConverter} from "../../.."

// A subset of StoryMapItem, with only the fields that concern the story map shape.
export const HistoryItemSchema = z.object({
	deleted: z.boolean(),
	effort: z.number().nullable(),
	userValue: z.number().nullable(),

	parentId: z.string().nullable(),
	versionId: z.string().nullable(),
})

export type HistoryItem = z.infer<typeof HistoryItemSchema>
export const HistoryItemConverter = genConverter(HistoryItemSchema)
