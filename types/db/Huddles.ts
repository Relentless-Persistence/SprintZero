import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const HuddleSchema = z.object({
	blockers: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	tasks: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),

	userId: idSchema,
})

export const Huddles = genDbNames(`Huddles`, HuddleSchema)
export type Huddle = z.infer<typeof HuddleSchema>
export const HuddleConverter = genConverter(HuddleSchema)
