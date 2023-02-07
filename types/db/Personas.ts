import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const PersonaSchema = z.object({
	prevQnA: z.string(),
	changes: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	dayInTheLife: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	description: z.string(),
	frustrations: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	goals: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	interactions: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	name: z.string(),
	priorities: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	responsibilities: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	tasks: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),

	productId: idSchema,
})

export const Personas = genDbNames(`Personas`, PersonaSchema)
export type Persona = z.infer<typeof PersonaSchema>
export const PersonaConverter = genConverter(PersonaSchema)
