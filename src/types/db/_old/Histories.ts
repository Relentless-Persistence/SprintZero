// Story map item histories

import {z} from "zod"

import {genConverter, serverTimestampSchema} from "../.."

export const OldHistorySchema = z.object({
	future: z.boolean(),
	items: z.record(
		z.string(),
		z.discriminatedUnion(`type`, [
			z.object({
				type: z.literal(`epic`),

				effort: z.number().nullable(),
				name: z.string().nullable(),
				userValue: z.number().nullable(),
			}),
			z.object({
				type: z.literal(`feature`),

				effort: z.number().nullable(),
				name: z.string().nullable(),
				userValue: z.number().nullable(),

				parentId: z.string().nullable(),
			}),
			z.object({
				type: z.literal(`story`),

				name: z.string().nullable(),

				parentId: z.string().nullable(),
				versionId: z.string().nullable(),
			}),
		]),
	),
	timestamp: serverTimestampSchema,
})

export type History = z.infer<typeof OldHistorySchema>
export const HistoryConverter = genConverter(OldHistorySchema)
