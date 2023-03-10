import {z} from "zod"

import {genConverter} from "~/types"

export const ResponsibilitySchema = z.object({
	text: z.string(),
})

export type Responsibility = z.infer<typeof ResponsibilitySchema>
export const ResponsibilityConverter = genConverter(ResponsibilitySchema)
