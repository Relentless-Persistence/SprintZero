import {z, ZodTypeAny} from "zod"

export type Version = {
	id: string

	version: string

	product_id: string
}

export const VersionSchema = z.object({
	id: z.string(),
	version: z.string(),
	product_id: z.string(),
} satisfies {[key in keyof Version]: ZodTypeAny})

export const VersionCollectionSchema = z.array(VersionSchema).min(1)
