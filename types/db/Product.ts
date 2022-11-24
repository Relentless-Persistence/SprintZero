import {z, ZodTypeAny} from "zod"

export type Product = {
	id: string

	cadence: string
	cost: string
	currency: string
	email1: string
	email2: string
	email3: string
	gate: `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday` | `Sunday`
	owner: string
	product: string

	updatedAt: Date
}

export const ProductSchema = z.object({
	id: z.string(),
	cadence: z.string(),
	cost: z.string(),
	currency: z.string(),
	email1: z.string(),
	email2: z.string(),
	email3: z.string(),
	gate: z.union([
		z.literal(`Monday`),
		z.literal(`Tuesday`),
		z.literal(`Wednesday`),
		z.literal(`Thursday`),
		z.literal(`Friday`),
		z.literal(`Saturday`),
		z.literal(`Sunday`),
	]),
	owner: z.string(),
	product: z.string(),
	updatedAt: z.date(),
} satisfies {[key in keyof Product]: ZodTypeAny})

export const ProductCollectionSchema = z.array(ProductSchema)
