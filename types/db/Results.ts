import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Result = {
	id: Id

	description: string

	goal: Id
}

export const ResultSchema = z.object({
	id: idSchema,

	description: z.string(),

	goal: idSchema,
} satisfies {[key in keyof Result]: ZodTypeAny})

export const ResultCollectionSchema = z.array(ResultSchema)
