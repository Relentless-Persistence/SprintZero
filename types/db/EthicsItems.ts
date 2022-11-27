import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type EthicsItem = {
	id: Id

	type: string

	story: Id
}

export const EthicsItemSchema = z.object({
	id: idSchema,

	type: z.string(),

	story: idSchema,
} satisfies {[key in keyof EthicsItem]: ZodTypeAny})

export const EthicsItemCollectionSchema = z.array(EthicsItemSchema)
