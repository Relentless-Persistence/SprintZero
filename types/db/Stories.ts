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

	comments: z.array(idSchema),
	epic: idSchema,
	feature: idSchema,
	nextStory: idSchema.nullable(),
	prevStory: idSchema.nullable(),
	product: idSchema,
	version: idSchema,
})
export const StoryCollectionSchema = z.array(StorySchema)

export const Stories = genDbNames(`Stories`, StorySchema)
export type Story = z.infer<typeof StorySchema>
