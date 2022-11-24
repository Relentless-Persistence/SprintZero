import {z, ZodTypeAny} from "zod"

export type Tasks = {
	id: string

	title: string
	board: string
	date: Date
	description: string
	order: number
	status: `Backlog`
	subject: string
	time: string

	product_id: string
}

export const TasksSchema = z.object({
	id: z.string(),
	title: z.string(),
	board: z.string(),
	date: z.date(),
	description: z.string(),
	order: z.number(),
	status: z.literal(`Backlog`),
	subject: z.string(),
	time: z.string(),
	product_id: z.string(),
} satisfies {[key in keyof Tasks]: ZodTypeAny})

export const TasksCollectionSchema = z.array(TasksSchema)
