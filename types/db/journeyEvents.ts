import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type JourneyEvent = {
	id: Id

	description: string
	end: Date
	isDelighted: string
	level: number
	participants: Array<{
		label: string
		checked: boolean
	}>
	start: Date
	title: string

	journey: Id
}

export const NJourneyEvents = {
	n: `JourneyEvents`,
	id: {n: `id`},
	description: {n: `description`},
	end: {n: `end`},
	isDelighted: {n: `isDelighted`},
	level: {n: `level`},
	participants: {
		n: `participants`,
		label: {n: `label`},
		checked: {n: `checked`},
	},
	start: {n: `start`},
	title: {n: `title`},
	journey: {n: `journey`},
} satisfies DbName<JourneyEvent>

export const JourneyEventSchema = z.object({
	id: idSchema,

	description: z.string(),
	end: z.date(),
	isDelighted: z.string(),
	level: z.number(),
	participants: z.array(
		z.object({
			label: z.string(),
			checked: z.boolean(),
		}),
	),
	start: z.date(),
	title: z.string(),

	journey: idSchema,
} satisfies ZodSchema<JourneyEvent>)

export const JourneyEventCollectionSchema = z.array(JourneyEventSchema)
