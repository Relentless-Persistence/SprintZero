import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Persona = {
	id: Id

	changes: string[]
	dailyLife: string[]
	frustrations: string[]
	goals: string[]
	interactions: string[]
	priorities: string[]
	responsibilities: string[]
	role: string
	tasks: string[]

	product: Id
}

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
} satisfies {[key in keyof Persona]: ZodTypeAny})

export const PersonaCollectionSchema = z.array(PersonaSchema)
