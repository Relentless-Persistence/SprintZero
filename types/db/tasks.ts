import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const TaskSchema = z.object({
	id: idSchema,

	board: z.string(),
	date: z.date(),
	description: z.string(),
	order: z.number(),
	status: z.literal(`Backlog`),
	subject: z.string(),
	time: z.string(),
	title: z.string(),

	product: idSchema,
})
export const TaskCollectionSchema = z.array(TaskSchema)

export const Tasks = genDbNames(`Tasks`, TaskSchema)
export type Task = z.infer<typeof TaskSchema>
