import { z } from "zod"

import { genConverter, timestampSchema } from "~/types"

const JobToBeDoneSchema = z.object({
	"when": z.string().optional(),
	"iWantTo": z.string().optional(),
	"soICan": z.string().optional()
})

export const ObjectiveSchema = z.object({
	name: z.string(),
	statement: z.string(),
	howMightWeStatement: z.string().optional(),
	targetPersona: z.string().array().optional(),
	jobToBeDone: JobToBeDoneSchema.optional(),
})

export type Objective = z.infer<typeof ObjectiveSchema>
export const ObjectiveConverter = genConverter(ObjectiveSchema)

const ObjectiveKeyResultSchema = z.object({
	createdAt: timestampSchema,
	text: z.string(),
})

export type ObjectiveKeyResult = z.infer<typeof ObjectiveKeyResultSchema>
export const ObjectiveKeyResultConverter = genConverter(ObjectiveKeyResultSchema)

const ObjectiveBreakdownReasonSchema = z.object({
	createdAt: timestampSchema,
	text: z.string(),
})

export type ObjectiveBreakdownReason = z.infer<typeof ObjectiveBreakdownReasonSchema>
export const ObjectiveBreakdownReasonConverter = genConverter(ObjectiveBreakdownReasonSchema)

