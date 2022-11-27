import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type HuddleBlockers = {
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

export const HuddleBlockersSchema = z.object({
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
} satisfies {[key in keyof HuddleBlockers]: ZodTypeAny})

export const HuddleBlockersCollectionSchema = z.array(HuddleBlockersSchema)
