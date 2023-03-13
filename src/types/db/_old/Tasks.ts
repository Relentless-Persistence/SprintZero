import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const OldTaskSchema = z.object({
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

	assigneeIds: z.array(z.string()),
	productId: z.string(),
})

export type Task = z.infer<typeof OldTaskSchema>
export const TaskConverter = genConverter(OldTaskSchema)
