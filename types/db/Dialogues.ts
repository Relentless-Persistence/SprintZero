import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type Dialogues = {
	id: string

	name: string
	education: string
	notes: Array<{
		title: string
		response: string
	}>
	post: string
	region: string
	type: `Identified` | `Contacted` | `Scheduled` | `Interviewed` | `Analyzing` | `Processed`

	product_id: string
	updatedAt: Timestamp
}

export const DialoguesSchema = z.object({
	id: z.string(),
	name: z.string(),
	education: z.string(),
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
	product_id: z.string(),
	updatedAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Dialogues]: ZodTypeAny})

export const DialoguesCollectionSchema = z.array(DialoguesSchema)
