import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const PersonaSchema = z.object({
	createdAt: timestampSchema,
	description: z.string(),
	name: z.string(),
})

export type Persona = z.infer<typeof PersonaSchema>
export const PersonaConverter = genConverter(PersonaSchema)
