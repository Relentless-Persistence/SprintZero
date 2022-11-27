import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

export type Vision = {
	id: Id

	competitors: string
	differentiators: string
	keyBenefits: string
	need: string
	targetCustomer: string

	product: Id

	createdAt: Date
}

export const VisionSchema = z.object({
	id: idSchema,

	competitors: z.string(),
	differentiators: z.string(),
	keyBenefits: z.string(),
	need: z.string(),
	targetCustomer: z.string(),

	product: idSchema,

	createdAt: z.date(),
} satisfies {[key in keyof Vision]: ZodTypeAny})

export const VisionCollectionSchema = z.array(VisionSchema)
