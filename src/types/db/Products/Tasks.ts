import { string, z } from "zod"

import { genConverter, timestampSchema } from "~/types"

export const TaskSchema = z.object({
	dueDate: timestampSchema.optional().nullable(),
	notes: z.string().optional(),
	status: z.enum([`todo`, `inProgress`, `review`, `done`]),
	subtasks: z.array(
		z.object({
			id: z.string(),
			checked: z.boolean(),
			name: z.string(),
		}),
	).optional(),
	title: z.string(),
	type: z.enum([`acceptanceCriteria`, `bug`, `dataScience`, `pipelines`, `random`]),
	storyId: z.string().optional(),
	assigneeIds: z.array(z.string()).optional(),
})

export type Task = z.infer<typeof TaskSchema>
export const TaskConverter = genConverter(TaskSchema)
