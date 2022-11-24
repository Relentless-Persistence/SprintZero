import {z, ZodTypeAny} from "zod"

export type Teams = {
	id: string

	expiry: Date
	type: `member`
	user: {
		uid: string
		name: string
		email: string
		avatar: string
	}

	product_id: string
}

export const TeamsSchema = z.object({
	id: z.string(),
	expiry: z.date(),
	type: z.literal(`member`),
	user: z.object({
		uid: z.string(),
		name: z.string(),
		email: z.string(),
		avatar: z.string(),
	}),
	product_id: z.string(),
} satisfies {[key in keyof Teams]: ZodTypeAny})

export const TeamsCollectionSchema = z.array(TeamsSchema)
