import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const StorySchema = z.object({
	id: idSchema,

	acceptanceCriteria: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	codeLink: z.string().url().nullable(),
	description: z.string(),
	designLink: z.string().url().nullable(),
	name: z.string(),
	points: z.number(),
	priority_level: z.number(),
	visibility_level: z.number(),

	comments: z.array(idSchema),
	epic: idSchema,
	feature: idSchema,
	next_story: idSchema.nullable(),
	prev_story: idSchema.nullable(),
	product: idSchema,
	version: idSchema,
})
export const StoryCollectionSchema = z.array(StorySchema)

export const Stories = genDbNames(`Stories`, StorySchema)
export type Story = z.infer<typeof StorySchema>
