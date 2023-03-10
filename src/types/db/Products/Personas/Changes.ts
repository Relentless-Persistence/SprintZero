import {z} from "zod"

import {genConverter} from "~/types"

export const ChangeSchema = z.object({
	text: z.string(),
})

export type Change = z.infer<typeof ChangeSchema>
export const ChangeConverter = genConverter(ChangeSchema)
