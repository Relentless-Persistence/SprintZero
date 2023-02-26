import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const ProductInviteSchema = z.object({
	productId: idSchema,
	userEmail: z.string(),
})

export type ProductInvite = z.infer<typeof ProductInviteSchema>
export const ProductInviteConverter = genConverter(ProductInviteSchema)
