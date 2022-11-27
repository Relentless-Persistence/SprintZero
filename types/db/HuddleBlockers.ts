import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const HuddleBlockerSchema = z.object({
	id: idSchema,

	completed: z.boolean(),
	title: z.string(),
	user: z.object({
		uid: z.string(),
		name: z.string(),
		email: z.string(),
		avatar: z.string(),
	}),

	product: idSchema,

	createdAt: z.instanceof(Timestamp),
})
export const HuddleBlockerCollectionSchema = z.array(HuddleBlockerSchema)

export const HuddleBlockers = genDbNames(`HuddleBlockers`, HuddleBlockerSchema)
export type HuddleBlocker = z.infer<typeof HuddleBlockerSchema>
