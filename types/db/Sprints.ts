import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Sprint = {
	id: Id

	endDate: Date
	name: string
	startDate: Date

	product: Id
}

export const SprintSchema = z.object({
	id: idSchema,

	endDate: z.date(),
	name: z.string(),
	startDate: z.date(),

	product: idSchema,
} satisfies {[key in keyof Sprint]: ZodTypeAny})

export const SprintCollectionSchema = z.array(SprintSchema)
