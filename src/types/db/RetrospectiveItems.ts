import {FrownOutlined, MehOutlined, SmileOutlined} from "@ant-design/icons"
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
	title: z.string().min(1, `Required`),
	type: z.enum([`enjoyable`, `puzzling`, `frustrating`]),

	productId: idSchema,
	userId: idSchema,
})

export type RetrospectiveItem = z.infer<typeof RetrospectiveItemSchema>
export const RetrospectiveItemConverter = genConverter(RetrospectiveItemSchema)

export const retrospectiveTabs = [
	[`enjoyable`, `Enjoyable`, SmileOutlined],
	[`puzzling`, `Puzzling`, MehOutlined],
	[`frustrating`, `Frustrating`, FrownOutlined],
] as const
