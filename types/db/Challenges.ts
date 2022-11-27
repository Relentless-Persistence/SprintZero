import {z, ZodTypeAny} from "zod"

export type Challenges = {
	id: string

	name: string
	accessibility_type: `Perceivable` | `Operable` | `Understandable` | `Robust`
	description: string

	product_id: string
}

export const ChallengesSchema = z.object({
	id: z.string(),
	name: z.string(),
	accessibility_type: z.union([
		z.literal(`Perceivable`),
		z.literal(`Operable`),
		z.literal(`Understandable`),
		z.literal(`Robust`),
	]),
	description: z.string(),
	product_id: z.string(),
} satisfies {[key in keyof Challenges]: ZodTypeAny})

export const ChallengesCollectionSchema = z.array(ChallengesSchema)
