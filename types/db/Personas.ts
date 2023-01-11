import {z} from "zod"

import {idSchema, genDbNames} from "~/types"

export const PersonaSchema = z.object({
	id: idSchema,

	changes: z.array(z.string()),
	dailyLife: z.array(z.string()),
	frustrations: z.array(z.string()),
	goals: z.array(z.string()),
	interactions: z.array(z.string()),
	priorities: z.array(z.string()),
	responsibilities: z.array(z.string()),
	role: z.string(),
	tasks: z.array(z.string()),

	product: idSchema,
})

export const Personas = genDbNames(`Personas`, PersonaSchema)
export type Persona = z.infer<typeof PersonaSchema>
