import {FrownOutlined, MehOutlined, SmileOutlined} from "@ant-design/icons"
import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const OldRetrospectiveItemSchema = z.object({
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

	productId: z.string(),
	userId: z.string(),
})

export type RetrospectiveItem = z.infer<typeof OldRetrospectiveItemSchema>
export const RetrospectiveItemConverter = genConverter(OldRetrospectiveItemSchema)

export const retrospectiveTabs = [
	[`enjoyable`, `Enjoyable`, SmileOutlined],
	[`puzzling`, `Puzzling`, MehOutlined],
	[`frustrating`, `Frustrating`, FrownOutlined],
] as const
