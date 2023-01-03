import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const DialogueSchema = z.object({
	id: idSchema,

	education: z.string(),
	name: z.string(),
	notes: z.array(
		z.object({
			title: z.string(),
			response: z.string(),
		}),
	),
	post: z.string(),
	region: z.string(),
	type: z.union([
		z.literal(`Identified`),
		z.literal(`Contacted`),
		z.literal(`Scheduled`),
		z.literal(`Interviewed`),
		z.literal(`Analyzing`),
		z.literal(`Processed`),
	]),

	product: idSchema,

	updatedAt: z.instanceof(Timestamp),
})

export const Dialogues = genDbNames(`Dialogues`, DialogueSchema)
export type Dialogue = z.infer<typeof DialogueSchema>
