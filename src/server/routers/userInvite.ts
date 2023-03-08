import {TRPCError} from "@trpc/server"
import {z} from "zod"

import type {WithFieldValue} from "firebase-admin/firestore"
import type {Product} from "~/types/db/Products"

import {procedure, router} from "../trpc"
import {genAdminConverter} from "~/types"
import {InviteSchema} from "~/types/db/Products/Invites"
import {ProductSchema} from "~/types/db/Products"
import {dbAdmin} from "~/utils/firebaseAdmin"

export const userInviteRouter = router({
	getProductInviteInfo: procedure
		.input(
			z.object({
				inviteToken: z.string(),
			}),
		)
		.query(async ({input: {inviteToken}}) => {
			const productInvite = await dbAdmin
				.doc(`ProductInvites/${inviteToken}`)
				.withConverter(genAdminConverter(InviteSchema))
				.get()
			if (!productInvite.exists) throw new TRPCError({code: `UNAUTHORIZED`})

			const product = await dbAdmin
				.doc(`Products/${productInvite.data()!.productId}`)
				.withConverter(genAdminConverter(ProductSchema))
				.get()
			if (!product.exists) throw new TRPCError({code: `UNAUTHORIZED`})

			return {
				productName: product.data()!.name,
			}
		}),
	putUserOnProduct: procedure
		.input(
			z.object({
				userId: z.string(),
				inviteToken: z.string(),
			}),
		)
		.mutation(async ({input: {userId, inviteToken}}) => {
			const productInvite = await dbAdmin
				.doc(`ProductInvites/${inviteToken}`)
				.withConverter(genAdminConverter(InviteSchema))
				.get()
			if (!productInvite.exists) throw new TRPCError({code: `UNAUTHORIZED`})

			const data: WithFieldValue<Partial<Product>> = {
				[`members.${userId}`]: {type: `editor`},
			}
			await dbAdmin
				.doc(`Products/${productInvite.data()!.productId}`)
				.withConverter(genAdminConverter(ProductSchema))
				.update(data)
		}),
})
