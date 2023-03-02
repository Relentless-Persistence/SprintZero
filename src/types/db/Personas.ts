import {z} from "zod"

import {genConverter, idSchema, timestampSchema} from "~/types"

export const PersonaSchema = z.object({
	changes: z.array(
		z.object({
			id: z.string(),
			text: z.string(),
		}),
	),
	createdAt: timestampSchema,
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

export type Persona = z.infer<typeof PersonaSchema>
export const PersonaConverter = genConverter(PersonaSchema)
