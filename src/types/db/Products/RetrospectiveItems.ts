import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const RetrospectiveItemSchema = z.object({
	archived: z.boolean(),
	createdAt: timestampSchema,
	description: z.string(),
	proposedActions: z.array(
		z.object({
			id: z.string(),
			checked: z.boolean(),
			label: z.string(),
		}),
	),
	title: z.string().min(1, `Required`),
	type: z.enum([`enjoyable`, `puzzling`, `frustrating`]),

	userId: z.string(),
})

export type RetrospectiveItem = z.infer<typeof RetrospectiveItemSchema>
export const RetrospectiveItemConverter = genConverter(RetrospectiveItemSchema)
