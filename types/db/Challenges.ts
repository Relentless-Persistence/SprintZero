import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const ChallengeSchema = z.object({
	id: idSchema,

	description: z.string(),
	name: z.string(),
	type: z.union([z.literal(`Perceivable`), z.literal(`Operable`), z.literal(`Understandable`), z.literal(`Robust`)]),

	product: idSchema,
})
export const ChallengeCollectionSchema = z.array(ChallengeSchema)

export const Challenges = genDbNames(`Challenges`, ChallengeSchema)
export type Challenge = z.infer<typeof ChallengeSchema>
