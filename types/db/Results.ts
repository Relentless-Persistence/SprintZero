import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Result = {
	id: Id

	description: string

	goal: Id
}

export const NResults = {
	n: `Results`,
	id: {n: `id`},
	description: {n: `description`},
	goal: {n: `goal`},
} satisfies DbName<Result>

export const ResultSchema = z.object({
	id: idSchema,

	description: z.string(),

	goal: idSchema,
} satisfies ZodSchema<Result>)

export const ResultCollectionSchema = z.array(ResultSchema)
