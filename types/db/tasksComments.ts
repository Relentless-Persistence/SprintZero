import {z, ZodTypeAny} from "zod"

export type TasksComments = {
	id: string

	author: {
		name: string
		avatar: string
	}
	comment: string

	task_id: string
}

export const TasksCommentsSchema = z.object({
	id: z.string(),
	author: z.object({
		name: z.string(),
		avatar: z.string(),
	}),
	comment: z.string(),
	task_id: z.string(),
} satisfies {[key in keyof TasksComments]: ZodTypeAny})

export const TasksCommentsCollectionSchema = z.array(TasksCommentsSchema)
