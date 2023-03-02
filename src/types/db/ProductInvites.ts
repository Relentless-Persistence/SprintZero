import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const ProductInviteSchema = z.object({
	email: z.string(),

	productId: idSchema,
})

export type ProductInvite = z.infer<typeof ProductInviteSchema>
export const ProductInviteConverter = genConverter(ProductInviteSchema)
