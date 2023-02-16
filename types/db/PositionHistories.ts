// Story map position histories

import {z} from "zod"

import {genConverter, idSchema, serverTimestampSchema} from ".."

export const PositionHistorySchema = z.object({
	items: z.record(
		idSchema,
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

				parentId: idSchema.nullable(),
			}),
			z.object({
				type: z.literal(`story`),

				name: z.string().nullable(),

				parentId: idSchema.nullable(),
				versionId: idSchema.nullable(),
			}),
		]),
	),
	timestamp: serverTimestampSchema,
})

export type PositionHistory = z.infer<typeof PositionHistorySchema>
export const PositionHistoryConverter = genConverter(PositionHistorySchema)
