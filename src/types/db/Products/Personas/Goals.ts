import {z} from "zod"

import {genConverter} from "~/types"

export const GoalSchema = z.object({
	name: z.string(),
	text: z.string(),
})

export const InteractionSchema = z.object({
	name: z.string(),
	text: z.string(),
})

export const CriticalitySchema = z.object({
	name: z.string(),
	text: z.string(),
})

export const ResponsibilitySchema = z.object({
	name: z.string(),
	text: z.string(),
})

export const PrioritySchema = z.object({
	name: z.string(),
	text: z.string(),
})

export const FrustrationSchema = z.object({
	name: z.string(),
	text: z.string(),
})

export const ChangeSchema = z.object({
	name: z.string(),
	text: z.string(),
})

export type Goal = z.infer<typeof GoalSchema>
export const GoalConverter = genConverter(GoalSchema)
export const InteractionConverter = genConverter(InteractionSchema)
export const CriticalityConverter = genConverter(CriticalitySchema)
export const ResponsibilityConverter = genConverter(ResponsibilitySchema)
export const PriorityConverter = genConverter(PrioritySchema)
export const FrustrationConverter = genConverter(FrustrationSchema)
export const ChangeConverter = genConverter(ChangeSchema)
