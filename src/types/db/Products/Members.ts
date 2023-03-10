import {z} from "zod"

import {genConverter} from "~/types"

export const MemberSchema = z.object({
	type: z.enum([`owner`, `editor`, `viewer`]),

	// This is necessary since it's not possible to query Members across Products by ID in Firestore.
	id: z.string(),
})

export type Member = z.infer<typeof MemberSchema>
export const MemberConverter = genConverter(MemberSchema)
