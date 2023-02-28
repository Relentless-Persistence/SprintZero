import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const RetrospectiveItemSchema = z.object({
	description: z.string(),
	proposedActions: z.array(
		z.object({
			id: z.string(),
			checked: z.boolean(),
			label: z.string(),
		}),
	),
	title: z.string(),
	type: z.enum([`enjoyable`, `puzzling`, `frustrating`]),

	productId: idSchema,
	userId: idSchema,
})

export type RetrospectiveItem = z.infer<typeof RetrospectiveItemSchema>
export const RetrospectiveItemConverter = genConverter(RetrospectiveItemSchema)

export const retrospectiveTabs = {
	enjoyable: `Enjoyable`,
	puzzling: `Puzzling`,
	frustrating: `Frustrating`,
}
