import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type EthicsItem = {
	id: Id

	type: string

	story: Id
}

export const NEthicsItems = {
	n: `EthicsItems`,
	id: {n: `id`},
	type: {n: `type`},
	story: {n: `story`},
} satisfies DbName<EthicsItem>

export const EthicsItemSchema = z.object({
	id: idSchema,

	type: z.string(),

	story: idSchema,
} satisfies ZodSchema<EthicsItem>)

export const EthicsItemCollectionSchema = z.array(EthicsItemSchema)
