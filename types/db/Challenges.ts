import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Challenge = {
	id: Id

	description: string
	name: string
	type: `Perceivable` | `Operable` | `Understandable` | `Robust`

	product: Id
}

export const NChallenges = {
	n: `Challenges`,
	id: {n: `id`},
	description: {n: `description`},
	name: {n: `name`},
	type: {n: `type`},
	product: {n: `product`},
} satisfies DbName<Challenge>

export const ChallengeSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	type: z.union([z.literal(`Perceivable`), z.literal(`Operable`), z.literal(`Understandable`), z.literal(`Robust`)]),

	product: idSchema,
} satisfies ZodSchema<Challenge>)

export const ChallengeCollectionSchema = z.array(ChallengeSchema)
