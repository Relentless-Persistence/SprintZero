import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const TaskSchema = z.object({
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
	type: z.string(),

	assigneeIds: z.array(z.string()),
})

export type Task = z.infer<typeof TaskSchema>
export const TaskConverter = genConverter(TaskSchema)
