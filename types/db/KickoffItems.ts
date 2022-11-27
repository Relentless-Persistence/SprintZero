import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type KickoffItem = {
	id: Id

	priorities: string[]
	problemStatement: string
	successMetrics: string[]

	product: Id
}

export const KickoffItemSchema = z.object({
	id: idSchema,

	priorities: z.array(z.string()),
	problemStatement: z.string(),
	successMetrics: z.array(z.string()),

	product: idSchema,
} satisfies {[key in keyof KickoffItem]: ZodTypeAny})

export const KickoffItemCollectionSchema = z.array(KickoffItemSchema)
