import {z} from "zod"

import {genConverter} from "~/types"

export const VersionSchema = z.object({
	deleted: z.boolean(),
	name: z.string(),
	updates: z.object({
		changed: z.object({
			description: z.string(),
			updatedAt: z.string().datetime(),
		}),
		change: z.object({
			description: z.string(),
			updatedAt: z.string().datetime(),
		}),
		impact: z.object({
			description: z.string(),
			updatedAt: z.string().datetime(),
		}),
	}),
})

export type Version = z.infer<typeof VersionSchema>
export const VersionConverter = genConverter(VersionSchema)
