import {z} from "zod"

import {genConverter} from "~/types"

export const VersionSchema = z.object({
	deleted: z.boolean(),
	name: z.string(),
})

export type Version = z.infer<typeof VersionSchema>
export const VersionConverter = genConverter(VersionSchema)
