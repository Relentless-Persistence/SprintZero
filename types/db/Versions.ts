import {z, ZodTypeAny} from "zod"

export type Versions = {
	id: string

	version: string

	product_id: string
}

export const VersionsSchema = z.object({
	id: z.string(),
	version: z.string(),
	product_id: z.string(),
} satisfies {[key in keyof Versions]: ZodTypeAny})

export const VersionsCollectionSchema = z.array(VersionsSchema).min(1)
