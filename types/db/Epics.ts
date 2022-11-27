import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Epic = {
	id: Id

	description: string
	name: string

	comments: Id[]
	features: Id[]
	keepers: Id[]
	product: Id
}

export const NEpics = {
	n: `Epics`,
	id: {n: `id`},
	description: {n: `description`},
	name: {n: `name`},
	comments: {n: `comments`},
	features: {n: `features`},
	keepers: {n: `keepers`},
	product: {n: `product`},
} satisfies DbName<Epic>

export const EpicSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	comments: z.array(idSchema),
	features: z.array(idSchema),
	keepers: z.array(idSchema),
	product: idSchema,
} satisfies ZodSchema<Epic>)

export const EpicCollectionSchema = z.array(EpicSchema)
