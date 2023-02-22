// Objective results

import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter} from "~/types"

export const ResultSchema = z.object({
	name: z.string(),
	createdAt: z.instanceof(Timestamp),
	text: z.string(),
})

export type Result = z.infer<typeof ResultSchema>
export const ResultConverter = genConverter(ResultSchema)
