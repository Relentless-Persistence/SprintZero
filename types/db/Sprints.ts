import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Sprint = {
	id: Id

	endDate: Date
	name: string
	startDate: Date

	product: Id
}

export const NSprints = {
	n: `Sprints`,
	id: {n: `id`},
	endDate: {n: `endDate`},
	name: {n: `name`},
	startDate: {n: `startDate`},
	product: {n: `product`},
} satisfies DbName<Sprint>

export const SprintSchema = z.object({
	id: idSchema,

	endDate: z.date(),
	name: z.string(),
	startDate: z.date(),

	product: idSchema,
} satisfies ZodSchema<Sprint>)

export const SprintCollectionSchema = z.array(SprintSchema)
