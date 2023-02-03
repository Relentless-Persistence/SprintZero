import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const TaskSchema = z.object({
	actions: z.array(
		z.object({
			id: z.string(),
			checked: z.boolean(),
			name: z.string(),
		}),
	),
	board: z.enum([`backlog`, `doing`, `review`, `done`]),
	description: z.string(),
	dueDate: z.instanceof(Timestamp),
	title: z.string(),

	productId: idSchema,
})

export const Tasks = genDbNames(`Tasks`, TaskSchema)
export type Task = z.infer<typeof TaskSchema>
export const TaskConverter = genConverter(TaskSchema)
