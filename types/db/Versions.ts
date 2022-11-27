import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Version = {
	id: Id

	version: string

	product: Id
}

export const VersionSchema = z.object({
	id: idSchema,

	version: z.string(),

	product: idSchema,
} satisfies {[key in keyof Version]: ZodTypeAny})

export const VersionCollectionSchema = z.array(VersionSchema).min(1)
