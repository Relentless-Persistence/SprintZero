import { z } from "zod"

import { genConverter, timestampSchema } from "~/types"

export const PersonaSchema = z.object({
	createdAt: timestampSchema,
	description: z.string(),
	name: z.string(),
	toolset: z.string().optional(),
	education: z.string().optional(),
})

export type Persona = z.infer<typeof PersonaSchema>
export const PersonaConverter = genConverter(PersonaSchema)
