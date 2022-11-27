import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const AccessibilityItemSchema = z.object({
	id: idSchema,

	type: z.string(),

	product: idSchema,
})
export const AccessibilityItemCollectionSchema = z.array(AccessibilityItemSchema)

export const AccessibilityItems = genDbNames(`AccessibilityItems`, AccessibilityItemSchema)
export type AccessibilityItem = z.infer<typeof AccessibilityItemSchema>
