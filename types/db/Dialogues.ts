import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type Dialogue = {
	id: Id

	education: string
	name: string
	notes: Array<{
		title: string
		response: string
	}>
	post: string
	region: string
	type: `Identified` | `Contacted` | `Scheduled` | `Interviewed` | `Analyzing` | `Processed`

	product: Id

	updatedAt: Timestamp
}

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
} satisfies {[key in keyof Dialogue]: ZodTypeAny})

export const DialogueCollectionSchema = z.array(DialogueSchema)
