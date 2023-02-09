import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const AccessibilityItemSchema = z.object({
	name: z.string(),
	text: z.string(),
	type: z.enum([`auditory`, `cognitive`, `physical`, `speech`, `visual`]),

	productId: idSchema,
})

export type AccessibilityItem = z.infer<typeof AccessibilityItemSchema>
export const AccessibilityItemConverter = genConverter(AccessibilityItemSchema)
