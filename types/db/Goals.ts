import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Goal = {
	id: Id

	description: string
	name: string

	product: Id
}

export const GoalSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	product: idSchema,
} satisfies {[key in keyof Goal]: ZodTypeAny})

export const GoalCollectionSchema = z.array(GoalSchema)
