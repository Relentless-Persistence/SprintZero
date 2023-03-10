import {z} from "zod"

import {genConverter} from "~/types"

export const PersonaTaskSchema = z.object({
	text: z.string(),
})

export type PersonasTask = z.infer<typeof PersonaTaskSchema>
export const PersonaTaskConverter = genConverter(PersonaTaskSchema)
