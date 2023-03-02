import {z} from "zod"

import {genConverter, idSchema, timestampSchema} from "~/types"

export const TaskSchema = z.object({
	board: z.string(),
	dueDate: timestampSchema,
	notes: z.string(),
	status: z.enum([`todo`, `inProgress`, `review`, `done`]),
	subtasks: z.array(
		z.object({
			id: z.string(),
			checked: z.boolean(),
			name: z.string(),
		}),
	),
	title: z.string(),

	assigneeIds: z.array(idSchema),
	productId: idSchema,
})

export type Task = z.infer<typeof TaskSchema>
export const TaskConverter = genConverter(TaskSchema)
