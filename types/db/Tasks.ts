import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const TaskSchema = z.object({
	actions: z.array(
		z.object({
			id: z.string(),
			checked: z.boolean(),
			name: z.string(),
		}),
	),
	status: z.enum([`backlog`, `doing`, `review`, `done`]),
	description: z.string(),
	dueDate: z.instanceof(Timestamp),
	title: z.string(),
	board: z.string(),

	productId: idSchema,
})

export type Task = z.infer<typeof TaskSchema>
export const TaskConverter = genConverter(TaskSchema)
