import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type KickoffItem = {
	id: Id

	priorities: string[]
	problemStatement: string
	successMetrics: string[]

	product: Id
}

export const NKickoffItems = {
	n: `KickoffItems`,
	id: {n: `id`},
	priorities: {n: `priorities`},
	problemStatement: {n: `problemStatement`},
	successMetrics: {n: `successMetrics`},
	product: {n: `product`},
} satisfies DbName<KickoffItem>

export const KickoffItemSchema = z.object({
	id: idSchema,

	priorities: z.array(z.string()),
	problemStatement: z.string(),
	successMetrics: z.array(z.string()),

	product: idSchema,
} satisfies ZodSchema<KickoffItem>)

export const KickoffItemCollectionSchema = z.array(KickoffItemSchema)
