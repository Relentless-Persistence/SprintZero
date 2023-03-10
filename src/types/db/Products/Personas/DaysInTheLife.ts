import {z} from "zod"

import {genConverter} from "~/types"

export const DayInTheLifeSchema = z.object({
	text: z.string(),
})

export type DayInTheLife = z.infer<typeof DayInTheLifeSchema>
export const DayInTheLifeConverter = genConverter(DayInTheLifeSchema)
