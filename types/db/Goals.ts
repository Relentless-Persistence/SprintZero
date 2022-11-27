import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Goal = {
	id: Id

	description: string
	name: string

	product: Id
}

export const NGoals = {
	n: `Goals`,
	id: {n: `id`},
	description: {n: `description`},
	name: {n: `name`},
	product: {n: `product`},
} satisfies DbName<Goal>

export const GoalSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	product: idSchema,
} satisfies ZodSchema<Goal>)

export const GoalCollectionSchema = z.array(GoalSchema)
