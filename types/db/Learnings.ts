import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Learning = {
	id: Id

	description: string
	name: string
	type: `Assumed` | `Validated`

	product: Id
}

export const LearningSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	type: z.union([z.literal(`Assumed`), z.literal(`Validated`)]),

	product: idSchema,
} satisfies {[key in keyof Learning]: ZodTypeAny})

export const LearningCollectionSchema = z.array(LearningSchema)
