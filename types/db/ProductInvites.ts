import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const ProductInvitesSchema = z.object({
	productId: idSchema,
})

export type ProductInvites = z.infer<typeof ProductInvitesSchema>
export const ProductInviteConverter = genConverter(ProductInvitesSchema)
