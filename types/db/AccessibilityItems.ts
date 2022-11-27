import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type AccessibilityItem = {
	id: Id

	type: string

	product: Id
}

export const AccessibilityItemSchema = z.object({
	id: idSchema,

	type: z.string(),

	product: idSchema,
} satisfies {[key in keyof AccessibilityItem]: ZodTypeAny})

export const AccessibilityItemCollectionSchema = z.array(AccessibilityItemSchema)
