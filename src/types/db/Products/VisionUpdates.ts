import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const VisionUpdateSchema = z.object({
	text: z.string(),
	timestamp: timestampSchema,

	userId: z.string(),
})

export type VisionUpdate = z.infer<typeof VisionUpdateSchema>
export const VisionUpdateConverter = genConverter(VisionUpdateSchema)
