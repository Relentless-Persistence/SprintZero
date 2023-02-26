import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const BetaUserSchema = z.object({
	emails: z.array(
		z.object({
			email: z.string(),
		}),
	),
})

export type BetaUser = z.infer<typeof BetaUserSchema>
export const BetaUserConverter = genConverter(BetaUserSchema)
