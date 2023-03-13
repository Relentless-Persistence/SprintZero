import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const OldPersonaSchema = z.object({
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

	productId: z.string(),
})

export type Persona = z.infer<typeof OldPersonaSchema>
export const PersonaConverter = genConverter(OldPersonaSchema)
