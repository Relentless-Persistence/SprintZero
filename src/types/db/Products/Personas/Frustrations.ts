import {z} from "zod"

import {genConverter} from "~/types"

export const FrustrationSchema = z.object({
	text: z.string(),
})

export type Frustration = z.infer<typeof FrustrationSchema>
export const FrustrationConverter = genConverter(FrustrationSchema)
