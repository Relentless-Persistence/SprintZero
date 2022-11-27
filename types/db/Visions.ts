import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const VisionSchema = z.object({
	id: idSchema,

	competitors: z.string(),
	differentiators: z.string(),
	keyBenefits: z.string(),
	need: z.string(),
	targetCustomer: z.string(),

	product: idSchema,

	createdAt: z.date(),
})
export const VisionCollectionSchema = z.array(VisionSchema)

export const Visions = genDbNames(`Visions`, VisionSchema)
export type Vision = z.infer<typeof VisionSchema>
