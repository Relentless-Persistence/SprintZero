import {z} from "zod"

import {genConverter, genDbNames} from "~/types"

export const VersionSchema = z.object({
	name: z.string(),
})

export const Versions = genDbNames(`Versions`, VersionSchema)
export type Version = z.infer<typeof VersionSchema>
export const VersionConverter = genConverter(VersionSchema)
