import {z, ZodTypeAny} from "zod"

export type Accessibility = {
	id: string

	type: string

	product_id: string
}

export const AccessibilitySchema = z.object({
	id: z.string(),
	type: z.string(),
	product_id: z.string(),
} satisfies {[key in keyof Accessibility]: ZodTypeAny})

export const AccessibilityCollectionSchema = z.array(AccessibilitySchema)
