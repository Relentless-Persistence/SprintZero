import {z, ZodTypeAny} from "zod"

export type Ethics = {
	id: string

	type: string

	storyId: string
}

export const EthicsSchema = z.object({
	id: z.string(),
	type: z.string(),
	storyId: z.string(),
} satisfies {[key in keyof Ethics]: ZodTypeAny})

export const EthicsCollectionSchema = z.array(EthicsSchema)
