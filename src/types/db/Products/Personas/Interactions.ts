import {z} from "zod"

import {genConverter} from "~/types"

export const InteractionSchema = z.object({
	text: z.string(),
})

export type Interaction = z.infer<typeof InteractionSchema>
export const InteractionConverter = genConverter(InteractionSchema)
