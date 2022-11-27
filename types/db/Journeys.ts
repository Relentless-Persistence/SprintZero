import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Journey = {
	id: Id

	duration: string
	durationType: string
	name: string
	start: string

	product: Id
}

export const NJourneys = {
	n: `Journeys`,
	id: {n: `id`},
	duration: {n: `duration`},
	durationType: {n: `durationType`},
	name: {n: `name`},
	start: {n: `start`},
	product: {n: `product`},
} satisfies DbName<Journey>

export const JourneySchema = z.object({
	id: idSchema,

	duration: z.string(),
	durationType: z.string(),
	name: z.string(),
	start: z.string(),

	product: idSchema,
} satisfies ZodSchema<Journey>)

export const JourneyCollectionSchema = z.array(JourneySchema)
