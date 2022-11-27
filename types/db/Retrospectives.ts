import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Retrospective = {
	id: Id

	description: string
	title: string
	type: `Enjoyable` | `Puzzling`
	user: {
		id: string
		name: string
		photo: string
	}

	product: Id
}

export const NRetrospectives = {
	n: `Retrospectives`,
	id: {n: `id`},
	description: {n: `description`},
	title: {n: `title`},
	type: {n: `type`},
	user: {
		n: `user`,
		id: {n: `user.id`},
		name: {n: `user.name`},
		photo: {n: `user.photo`},
	},
	product: {n: `product`},
} satisfies DbName<Retrospective>

export const RetrospectiveSchema = z.object({
	id: idSchema,

	description: z.string(),
	title: z.string(),
	type: z.union([z.literal(`Enjoyable`), z.literal(`Puzzling`)]),
	user: z.object({
		id: z.string(),
		name: z.string(),
		photo: z.string(),
	}),

	product: idSchema,
} satisfies ZodSchema<Retrospective>)

export const RetrospectiveCollectionSchema = z.array(RetrospectiveSchema)
