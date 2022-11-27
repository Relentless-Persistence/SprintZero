import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Feature = {
	id: Id

	description: string
	name: string

	comments: Id[]
	stories: Id[]

	epic: Id
}

export const FeatureSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	comments: z.array(idSchema),
	stories: z.array(idSchema),

	epic: idSchema,
} satisfies {[key in keyof Feature]: ZodTypeAny})

export const FeatureCollectionSchema = z.array(FeatureSchema)
