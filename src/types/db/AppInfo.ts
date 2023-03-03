import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const AppInfoSchema = z.object({
	maintenanceMode: z.boolean(),
	updatedAt: timestampSchema,
	version: z.number().int(),
})

export type AppInfo = z.infer<typeof AppInfoSchema>
export const AppInfoConverter = genConverter(AppInfoSchema)
