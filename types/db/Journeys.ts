import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Journey = {
	id: Id

	duration: string
	durationType: string
	name: string
	start: string

	product: Id
}

export const JourneySchema = z.object({
	id: idSchema,

	duration: z.string(),
	durationType: z.string(),
	name: z.string(),
	start: z.string(),

	product: idSchema,
} satisfies {[key in keyof Journey]: ZodTypeAny})

export const JourneyCollectionSchema = z.array(JourneySchema)
