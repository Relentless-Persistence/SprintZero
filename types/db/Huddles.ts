import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const HuddlesSchema = z.object({
	id: idSchema,

	completed: z.boolean(),
	title: z.string(),

	product: idSchema,
	user: idSchema,

	createdAt: z.instanceof(Timestamp),
})

export const Huddles = genDbNames(`Huddles`, HuddlesSchema)
export type Huddle = z.infer<typeof HuddlesSchema>
