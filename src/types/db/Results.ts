// Objective results

import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter} from "~/types"

export const ResultSchema = z.object({
	createdAt: z.instanceof(Timestamp),
	text: z.string().min(1, `Required`),
})

export type Result = z.infer<typeof ResultSchema>
export const ResultConverter = genConverter(ResultSchema)
