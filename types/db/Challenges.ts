import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Challenge = {
	id: Id

	description: string
	name: string
	type: `Perceivable` | `Operable` | `Understandable` | `Robust`

	product: Id
}

export const ChallengeSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	type: z.union([z.literal(`Perceivable`), z.literal(`Operable`), z.literal(`Understandable`), z.literal(`Robust`)]),

	product: idSchema,
} satisfies {[key in keyof Challenge]: ZodTypeAny})

export const ChallengeCollectionSchema = z.array(ChallengeSchema)
