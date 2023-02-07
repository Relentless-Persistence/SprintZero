import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const DialogueSchema = z.object({
	name: z.string(),
	stage: z.string(),
	persona: z.string(),
	notes: z.array(
		z.object({
			question: z.string(),
			response: z.string(),
		}),
	),
	region: z.string(),
	education: z.string(),
	productId: idSchema,
})

export const Dialogues = genDbNames(`Dialogues`, DialogueSchema)
export type Dialogue = z.infer<typeof DialogueSchema>
export const DialogueConverter = genConverter(DialogueSchema)