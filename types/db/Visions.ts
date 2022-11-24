import {z, ZodTypeAny} from "zod"

export type Visions = {
	id: string

	competitors: string
	differentiators: string
	keyBenefits: string
	need: string
	targetCustomer: string

	product_id: string
	createdAt: Date
}

export const VisionsSchema = z.object({
	id: z.string(),
	competitors: z.string(),
	differentiators: z.string(),
	keyBenefits: z.string(),
	need: z.string(),
	targetCustomer: z.string(),
	product_id: z.string(),
	createdAt: z.date(),
} satisfies {[key in keyof Visions]: ZodTypeAny})

export const VisionsCollectionSchema = z.array(VisionsSchema)
