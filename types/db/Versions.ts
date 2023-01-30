import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const VersionSchema = z.object({
	id: idSchema,

	name: z.string(),

	productId: idSchema,
})

export const Versions = genDbNames(`Versions`, VersionSchema)
export type Version = z.infer<typeof VersionSchema>
