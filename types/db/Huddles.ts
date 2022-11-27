import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

export type Huddles = {
	id: string

	title: string
	completed: boolean
	user: {
		uid: string
		name: string
		email: string
		avatar: string
	}

	product_id: string
	createdAt: Timestamp
}

export const HuddlesSchema = z.object({
	id: z.string(),
	title: z.string(),
	completed: z.boolean(),
	user: z.object({
		uid: z.string(),
		name: z.string(),
		email: z.string(),
		avatar: z.string(),
	}),
	product_id: z.string(),
	createdAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Huddles]: ZodTypeAny})

export const HuddlesCollectionSchema = z.array(HuddlesSchema)
