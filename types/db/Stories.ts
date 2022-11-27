import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

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

export const NStories = {
	n: `Stories`,
	id: {n: `id`},
	name: {n: `name`},
	description: {n: `description`},
	accepanceCriteria: {
		n: `accepanceCriteria`,
		name: {n: `name`},
		checked: {n: `checked`},
	},
	comments: {n: `comments`},
	feature: {n: `feature`},
} satisfies DbName<Story>

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
} satisfies ZodSchema<Story>)

export const StoryCollectionSchema = z.array(StorySchema)
