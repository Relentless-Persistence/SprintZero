import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Learning = {
	id: Id

	description: string
	name: string
	type: `Assumed` | `Validated`

	product: Id
}

export const NLearnings = {
	n: `Learnings`,
	id: {n: `id`},
	description: {n: `description`},
	name: {n: `name`},
	type: {n: `type`},
	product: {n: `product`},
} satisfies DbName<Learning>

export const LearningSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	type: z.union([z.literal(`Assumed`), z.literal(`Validated`)]),

	product: idSchema,
} satisfies ZodSchema<Learning>)

export const LearningCollectionSchema = z.array(LearningSchema)
