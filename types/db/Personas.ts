import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

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

export const NPersonas = {
	n: `Personas`,
	id: {n: `id`},
	changes: {n: `changes`},
	dailyLife: {n: `dailyLife`},
	frustrations: {n: `frustrations`},
	goals: {n: `goals`},
	interactions: {n: `interactions`},
	priorities: {n: `priorities`},
	responsibilities: {n: `responsibilities`},
	role: {n: `role`},
	tasks: {n: `tasks`},
	product: {n: `product`},
} satisfies DbName<Persona>

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
} satisfies ZodSchema<Persona>)

export const PersonaCollectionSchema = z.array(PersonaSchema)
