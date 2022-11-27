import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type Epic = {
	id: Id

	description: string
	name: string

	comments: Id[]
	features: Id[]
	keepers: Id[]
	product: Id

	updatedAt: Timestamp
}

export const EpicSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),

	comments: z.array(idSchema),
	features: z.array(idSchema),
	keepers: z.array(idSchema),
	product: idSchema,

	updatedAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Epic]: ZodTypeAny})

export const EpicCollectionSchema = z.array(EpicSchema)
