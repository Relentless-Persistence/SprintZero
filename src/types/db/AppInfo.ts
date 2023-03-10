import {z} from "zod"

import {genConverter} from "~/types"

export const AppInfoSchema = z.object({
	maintenanceMode: z.boolean(),
})

export type AppInfo = z.infer<typeof AppInfoSchema>
export const AppInfoConverter = genConverter(AppInfoSchema)
