import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Feature = {
	id: Id

	description: string
	name: string

	comments: Id[]
	stories: Id[]

	epic: Id
}

export const NFeatures = {
	n: `Features`,
	id: {n: `id`},
	description: {n: `description`},
	name: {n: `name`},
	comments: {n: `comments`},
	stories: {n: `stories`},
	epic: {n: `epic`},
} satisfies DbName<Feature>

export const FeatureSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	comments: z.array(idSchema),
	stories: z.array(idSchema),

	epic: idSchema,
} satisfies ZodSchema<Feature>)

export const FeatureCollectionSchema = z.array(FeatureSchema)
