import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

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

export const NVisions = {
	n: `Visions`,
	id: {n: `id`},
	competitors: {n: `competitors`},
	differentiators: {n: `differentiators`},
	keyBenefits: {n: `keyBenefits`},
	need: {n: `need`},
	targetCustomer: {n: `targetCustomer`},
	product: {n: `product`},
	createdAt: {n: `createdAt`},
} satisfies DbName<Vision>

export const VisionSchema = z.object({
	id: idSchema,

	competitors: z.string(),
	differentiators: z.string(),
	keyBenefits: z.string(),
	need: z.string(),
	targetCustomer: z.string(),

	product: idSchema,

	createdAt: z.date(),
} satisfies ZodSchema<Vision>)

export const VisionCollectionSchema = z.array(VisionSchema)
