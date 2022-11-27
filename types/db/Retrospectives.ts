import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Retrospective = {
	id: Id

	description: string
	title: string
	type: `Enjoyable` | `Puzzling`
	user: {
		id: string
		name: string
		photo: string
	}

	product: Id
}

export const RetrospectiveSchema = z.object({
	id: idSchema,

	description: z.string(),
	title: z.string(),
	type: z.union([z.literal(`Enjoyable`), z.literal(`Puzzling`)]),
	user: z.object({
		id: z.string(),
		name: z.string(),
		photo: z.string(),
	}),

	product: idSchema,
} satisfies {[key in keyof Retrospective]: ZodTypeAny})

export const RetrospectiveCollectionSchema = z.array(RetrospectiveSchema)
