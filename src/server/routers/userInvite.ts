import { TRPCError } from "@trpc/server"
import { FieldPath, Timestamp } from "firebase-admin/firestore"
import { z } from "zod"

import { procedure, router } from "../trpc"
import { genAdminConverter } from "~/types"
import { ProductSchema } from "~/types/db/Products"
import { HuddleSchema } from "~/types/db/Products/Huddles"
import { InviteSchema } from "~/types/db/Products/Invites"
import { MemberSchema } from "~/types/db/Products/Members"
import { dbAdmin } from "~/utils/firebaseAdmin"

export const userInviteRouter = router({
	getProductInviteInfo: procedure
		.input(
			z.object({
				inviteToken: z.string(),
			}),
		)
		.query(async ({ input: { inviteToken } }) => {
			const invites = await dbAdmin
				.collection(`Invites/${inviteToken}`)
				.withConverter(genAdminConverter(InviteSchema))
				.get()
			if (!invites.docs[0]) throw new TRPCError({ code: `UNAUTHORIZED` })
			const invite = invites.docs[0]!

			const product = await dbAdmin
				.doc(invite.ref.parent.parent!.path)
				.withConverter(genAdminConverter(ProductSchema))
				.get()
			if (!product.exists) throw new TRPCError({ code: `UNAUTHORIZED` })

			return {
				productName: product.data()!.name,
			}
		}),
	putUserOnProduct: procedure
		.input(
			z.object({
				userId: z.string(),
				userName: z.string(),
				userAvatar: z.string().nullable(),

				inviteToken: z.string(),
			}),
		)
		.mutation(async ({ input: { userId, userName, userAvatar, inviteToken } }) => {
			// const productInvite = await dbAdmin
			// 	.collectionGroup(`Invites`)
			// 	.where(FieldPath.documentId(), `==`, inviteToken)
			// 	.withConverter(genAdminConverter(InviteSchema))
			// 	.get()

			const productInvite = await dbAdmin
				.collection(`Invites`)
				.where(FieldPath.documentId(), `==`, inviteToken)
				.withConverter(genAdminConverter(InviteSchema))
				.get();


			if (productInvite.docs.length === 0) throw new TRPCError({ code: `UNAUTHORIZED` })
			const invite = productInvite.docs[0]!

			const batch = dbAdmin.batch()
			batch.set(
				dbAdmin
					.collection(`Products`)
					.doc(invite.data().productId)
					.collection(`Members`)
					.doc(userId)
					.withConverter(genAdminConverter(MemberSchema)),
				{
					name: userName,
					avatar: userAvatar,
					type: `editor`,
					id: userId,
				},
			)
			batch.set(
				dbAdmin
					.collection(`Products`)
					.doc(invite.data().productId)
					.collection(`Huddles`)
					.doc(userId)
					.withConverter(genAdminConverter(HuddleSchema)),
				{
					blockerStoryIds: [],
					todayStoryIds: [],
					updatedAt: Timestamp.now(),
					yesterdayStoryIds: [],
				},
			)
			await batch.commit()
		}),
})
