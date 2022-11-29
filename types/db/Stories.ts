import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const StorySchema = z.object({
	id: idSchema,

	accepanceCriteria: z.array(
		z.object({
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	description: z.string(),
	name: z.string(),

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
