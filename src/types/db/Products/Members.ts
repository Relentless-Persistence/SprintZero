import {z} from "zod"

import {genConverter} from "~/types"

export const MemberSchema = z.object({
	type: z.enum([`owner`, `editor`, `viewer`]),
})

export type Member = z.infer<typeof MemberSchema>
export const MemberConverter = genConverter(MemberSchema)
