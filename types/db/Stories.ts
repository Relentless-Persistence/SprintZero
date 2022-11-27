import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Story = {
	id: Id

	name: string
	description: string
	accepanceCriteria: Array<{
		name: string
		checked: boolean
	}>

	comments: Id[]
	feature: Id
}

export const StorySchema = z.object({
	id: idSchema,

	name: z.string(),
	description: z.string(),
	accepanceCriteria: z.array(
		z.object({
			name: z.string(),
			checked: z.boolean(),
		}),
	),

	comments: z.array(idSchema),
	feature: idSchema,
} satisfies {[key in keyof Story]: ZodTypeAny})

export const StoryCollectionSchema = z.array(StorySchema)
