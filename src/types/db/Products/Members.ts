import {z} from "zod"

import {genConverter} from "../.."

export const MemberSchema = z.object({
	avatar: z.string().nullable(),
	name: z.string(),
	type: z.enum([`owner`, `editor`, `viewer`]),

	id: z.string(),
})

export type Member = z.infer<typeof MemberSchema>
export const MemberConverter = genConverter(MemberSchema)
