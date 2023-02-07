import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const AccessibilityItemSchema = z.object({
	name: z.string(),
	text: z.string(),
	type: z.enum([`auditory`, `cognitive`, `physical`, `speech`, `visual`]),

	productId: idSchema,
})

export const AccessibilityItems = genDbNames(`AccessibilityItems`, AccessibilityItemSchema)
export type AccessibilityItem = z.infer<typeof AccessibilityItemSchema>
export const AccessibilityItemConverter = genConverter(AccessibilityItemSchema)
