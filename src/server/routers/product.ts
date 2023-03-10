import crypto from "crypto"
import {FieldValue, Timestamp} from "firebase-admin/firestore"
import {nanoid} from "nanoid"
import querystring from "querystring"
import invariant from "tiny-invariant"
import {z} from "zod"

import {procedure, router} from "../trpc"
import {genAdminConverter} from "~/types"
import {ProductSchema} from "~/types/db/Products"
import {HuddleSchema} from "~/types/db/Products/Huddles"
import {InviteSchema} from "~/types/db/Products/Invites"
import {MemberSchema} from "~/types/db/Products/Members"
import {ObjectiveSchema} from "~/types/db/Products/Objectives"
import {StoryMapHistorySchema} from "~/types/db/Products/StoryMapHistories"
import {VersionSchema} from "~/types/db/Products/Versions"
import {UserSchema} from "~/types/db/Users"
import {authAdmin, dbAdmin} from "~/utils/firebaseAdmin"
import {sendEmail} from "~/utils/sendEmail"

export const productRouter = router({
	create: procedure
		.input(
			ProductSchema.pick({
				cadence: true,
				effortCost: true,
				effortCostCurrencySymbol: true,
				name: true,
				sprintStartDayOfWeek: true,
			}).extend({
				userIdToken: z.string(),
			}),
		)
		.mutation(
			async ({input: {cadence, effortCost, effortCostCurrencySymbol, name, sprintStartDayOfWeek, userIdToken}}) => {
				const user = await authAdmin.verifyIdToken(userIdToken)

				const slug = `${name.replaceAll(/[^A-Za-z0-9]/g, ``)}-${nanoid().slice(0, 6)}`
				const storyMapHistoryId = nanoid()

				const batch = dbAdmin.batch()
				const product = dbAdmin.collection(`Products`).doc(slug)
				batch.set(product.withConverter(genAdminConverter(ProductSchema)), {
					cadence,
					effortCost,
					effortCostCurrencySymbol,
					name,
					sprintStartDayOfWeek,
					createdAt: Timestamp.now(),

					storyMapCurrentHistoryId: storyMapHistoryId,
					storyMapUpdatedAt: Timestamp.now(),

					problemStatement: ``,

					accessibility: {
						auditory: [false, false, false, false, false],
						cognitive: [false, false, false, false, false, false],
						physical: [false, false, false, false, false],
						speech: [false, false],
						visual: [false, false, false, false, false, false, false, false],
					},

					finalVision: ``,
					productType: null,
					valueProposition: null,
				})
				batch.set(product.collection(`Members`).doc(user.uid).withConverter(genAdminConverter(MemberSchema)), {
					id: user.uid,
					type: `owner`,
				})
				batch.set(product.collection(`Huddles`).doc(user.uid).withConverter(genAdminConverter(HuddleSchema)), {
					updatedAt: Timestamp.now(),
					blockerStoryIds: [],
					todayStoryIds: [],
					yesterdayStoryIds: [],
				})
				batch.set(
					product
						.collection(`StoryMapHistories`)
						.doc(storyMapHistoryId)
						.withConverter(genAdminConverter(StoryMapHistorySchema)),
					{
						future: false,
						timestamp: FieldValue.serverTimestamp(),
					},
				)
				batch.set(product.collection(`Versions`).doc(nanoid()).withConverter(genAdminConverter(VersionSchema)), {
					deleted: false,
					name: `1.0`,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `001`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `002`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `003`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `004`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `005`,
					statement: ``,
				})
				await batch.commit()

				return {productId: slug}
			},
		),
	inviteUser: procedure
		.input(
			z.object({
				email: z.string().email(),
				productId: z.string(),
				userIdToken: z.string(),
			}),
		)
		.mutation(async ({input: {email, productId, userIdToken}}) => {
			const user = await authAdmin.verifyIdToken(userIdToken)
			const dbUser = await dbAdmin.collection(`Users`).doc(user.uid).withConverter(genAdminConverter(UserSchema)).get()
			const userData = dbUser.data()
			invariant(userData)
			const product = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.withConverter(genAdminConverter(ProductSchema))
				.get()
			const productData = product.data()
			invariant(productData)

			const inviteToken = crypto.randomBytes(16).toString(`hex`)
			await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.collection(`Invites`)
				.doc(inviteToken)
				.withConverter(genAdminConverter(InviteSchema))
				.set({
					email,
					id: inviteToken,
				})

			const queryParams = querystring.stringify({invite_token: inviteToken})
			const inviteLink = `https://web.sprintzero.app/sign-in?${queryParams}`
			await sendEmail({
				to: email,
				from: `no-reply@sprintzero.app`,
				subject: `SprintZero | Member Invite`,
				body: `<b>${userData.name}</b> has invited you to join the product <b>"${productData.name}"</b>.<br><br><a href="${inviteLink}">Accept Invitation</a>`,
			})
		}),
})