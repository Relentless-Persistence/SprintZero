import {z} from "zod"

import {genConverter} from "~/types"

export const OldVersionSchema = z.object({
	name: z.string(),
})

export type Version = z.infer<typeof OldVersionSchema>
export const VersionConverter = genConverter(OldVersionSchema)
