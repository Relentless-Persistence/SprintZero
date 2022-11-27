import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

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
})
export const StoryCollectionSchema = z.array(StorySchema)

export const Stories = genDbNames(`Stories`, StorySchema)
export type Story = z.infer<typeof StorySchema>
