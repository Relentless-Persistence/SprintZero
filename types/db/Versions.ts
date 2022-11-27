import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const VersionSchema = z.object({
	id: idSchema,

	name: z.string(),

	product: idSchema,
})
export const VersionCollectionSchema = z.array(VersionSchema).min(1)

export const Versions = genDbNames(`Versions`, VersionSchema)
export type Version = z.infer<typeof VersionSchema>
