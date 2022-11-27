import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Version = {
	id: Id

	name: string

	product: Id
}

export const NVersions = {
	n: `Versions`,
	id: {n: `id`},
	name: {n: `name`},
	product: {n: `product`},
} satisfies DbName<Version>

export const VersionSchema = z.object({
	id: idSchema,

	name: z.string(),

	product: idSchema,
} satisfies ZodSchema<Version>)

export const VersionCollectionSchema = z.array(VersionSchema).min(1)
