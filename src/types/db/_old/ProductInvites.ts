import {z} from "zod"

import {genConverter} from "~/types"

export const OldProductInviteSchema = z.object({
	email: z.string(),

	productId: z.string(),
})

export type ProductInvite = z.infer<typeof OldProductInviteSchema>
export const ProductInviteConverter = genConverter(OldProductInviteSchema)
