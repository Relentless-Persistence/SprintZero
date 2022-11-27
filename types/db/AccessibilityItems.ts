import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type AccessibilityItem = {
	id: Id

	type: string

	product: Id
}

export const NAccessibilityItems = {
	n: `AccesibilityItems`,
	id: {n: `id`},
	type: {n: `type`},
	product: {n: `product`},
} satisfies DbName<AccessibilityItem>

export const AccessibilityItemSchema = z.object({
	id: idSchema,

	type: z.string(),

	product: idSchema,
} satisfies ZodSchema<AccessibilityItem>)

export const AccessibilityItemCollectionSchema = z.array(AccessibilityItemSchema)
