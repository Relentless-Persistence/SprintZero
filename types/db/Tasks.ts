import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const TaskSchema = z.object({
	id: idSchema,

	title: z.string(),
  board: z.string(),
  date: z.date(),
  description: z.string(),
  status: z.string(),
  subject: z.string(),
  time: z.string(),

	productId: idSchema,
})

export const Tasks = genDbNames(`Tasks`, TaskSchema)
export type Task = z.infer<typeof TaskSchema>
