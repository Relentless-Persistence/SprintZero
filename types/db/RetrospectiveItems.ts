import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const RetrospectiveItemsSchema = z.object({
	description: z.string(),
	proposedActions: z.array(
		z.object({
			id: z.string(),
			checked: z.boolean(),
			label: z.string(),
		}),
	),
	title: z.string(),
	type: z.union([z.literal(`enjoyable`), z.literal(`puzzling`), z.literal(`frustrating`)]),

	productId: idSchema,
	userId: idSchema,
})

export const RetrospectiveItems = genDbNames(`RetrospectiveItems`, RetrospectiveItemsSchema)
export type RetrospectiveItem = z.infer<typeof RetrospectiveItemsSchema>
export const RetrospectiveItemConverter = genConverter(RetrospectiveItemsSchema)

export const retrospectiveTabs = {
	enjoyable: `Enjoyable`,
	puzzling: `Puzzling`,
	frustrating: `Frustrating`,
}
