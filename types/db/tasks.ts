import {z, ZodTypeAny} from "zod"

import type {Id} from "~/types"

import {idSchema} from "~/types"

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
} satisfies {[key in keyof Task]: ZodTypeAny})

export const TaskCollectionSchema = z.array(TaskSchema)
