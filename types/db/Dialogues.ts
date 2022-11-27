import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema
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

export const NDialogue = {
	n: `Dialogue`,
	id: {n: `id`},
	education: {n: `education`},
	name: {n: `name`},
	notes: {n: `notes`, title: {n: `title`}, response: {n: `response`}},
	post: {n: `post`},
	region: {n: `region`},
	type: {n: `type`},
	product: {n: `product`},
	updatedAt: {n: `updatedAt`},
} satisfies DbName<Dialogue>

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
} satisfies ZodSchema<Dialogue>)

export const DialogueCollectionSchema = z.array(DialogueSchema)
