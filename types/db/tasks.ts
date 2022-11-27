import {z} from "zod"

import type {Id} from "~/types"

import {idSchema, DbName, ZodSchema} from "~/types"

// Workaround https://github.com/swc-project/swc/issues/6514
idSchema

export type Task = {
	id: Id

	board: string
	date: Date
	description: string
	order: number
	status: `Backlog`
	subject: string
	time: string
	title: string

	product: Id
}

export const NTasks = {
	n: `Tasks`,
	id: {n: `id`},
	board: {n: `board`},
	date: {n: `date`},
	description: {n: `description`},
	order: {n: `order`},
	status: {n: `status`},
	subject: {n: `subject`},
	time: {n: `time`},
	title: {n: `title`},
	product: {n: `product`},
} satisfies DbName<Task>

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
} satisfies ZodSchema<Task>)

export const TaskCollectionSchema = z.array(TaskSchema)
