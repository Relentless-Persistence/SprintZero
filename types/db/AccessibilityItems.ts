import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const AccessibilityItemSchema = z.object({
	id: idSchema,

	name: z.string(),
	text: z.string(),
	type: z.union([
		z.literal(`auditory`),
		z.literal(`cognitive`),
		z.literal(`physical`),
		z.literal(`speech`),
		z.literal(`visual`),
	]),

	productId: idSchema,
})

export const AccessibilityItems = genDbNames(`AccessibilityItems`, AccessibilityItemSchema)
export type AccessibilityItem = z.infer<typeof AccessibilityItemSchema>
