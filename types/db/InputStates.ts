import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const InputStateSchema = z.object({
	id: idSchema,

	selections: z.record(
		z.object({
			start: z.number().nullable(),
			end: z.number().nullable(),
			direction: z.union([z.literal(`none`), z.literal(`forward`), z.literal(`backward`)]).nullable(),
		}),
	),
})

export const InputStates = genDbNames(`InputStates`, InputStateSchema)
export type InputState = z.infer<typeof InputStateSchema>
