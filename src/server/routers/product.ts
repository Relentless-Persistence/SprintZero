import {TRPCError} from "@trpc/server"
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
				userName: z.string(),
				userAvatar: z.string().nullable(),
			}),
		)
		.mutation(
			async ({
				input: {
					cadence,
					effortCost,
					effortCostCurrencySymbol,
					name,
					sprintStartDayOfWeek,
					userIdToken,
					userName,
					userAvatar,
				},
			}) => {
				console.log(`user - 1`, userIdToken)
				const user = await authAdmin.verifyIdToken(userIdToken)
				console.log(`user - 2`, user)

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
					id: slug,

					storyMapCurrentHistoryId: storyMapHistoryId,
					storyMapUpdatedAt: Timestamp.now(),

					problemStatement: ``,

					accessibility: {
						auditory: [false, false, false, false, false],
						cognitive: [false, false, false, false, false, false],
						physical: [false, false, false, false, false],
						speech: [false, false],
						visual: [false, false, false, false, false, false, false, false],
						mobile: [false, false, false, false, false, false, false],
					},

					finalVision: ``,
					productTypes: [`web`],
					valueProposition: ``,
					features: [``],

					voiceData: {
						voice: {
							columns: [
								{
									title: `Theme A`,
									dataIndex: `col1`,
									key: `col1`,
									editable: true,
								},
								{
									title: `Theme B`,
									dataIndex: `col2`,
									key: `col2`,
									editable: true,
								},
								{
									title: `Theme C`,
									dataIndex: `col3`,
									key: `col3`,
									editable: true,
								},
							],
							rows: [
								{
									key: ``,
									col1: `Theme A`,
									col2: `Theme B`,
									col3: `Theme C`,
								},
								{
									key: `Concepts`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
								{
									key: `Vocabulary`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
								{
									key: `Verbosity`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
								{
									key: `Grammar`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
								{
									key: `Punctuation`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
								{
									key: `Casing`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
							],
						},

						tone: {
							columns: [
								{
									title: `Theme A`,
									dataIndex: `col1`,
									key: `col1`,
									editable: true,
								},
								{
									title: `Theme B`,
									dataIndex: `col2`,
									key: `col2`,
									editable: true,
								},
								{
									title: `Theme C`,
									dataIndex: `col3`,
									key: `col3`,
									editable: true,
								},
							],
							rows: [
								{
									key: ``,
									col1: `Theme A`,
									col2: `Theme B`,
									col3: `Theme C`,
								},
								{
									key: `Concepts`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
								{
									key: `Use Cases`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
								{
									key: `Desired Effect`,
									col1: ``,
									col2: ``,
									col3: ``,
								},
							],
						},
					},
				})
				batch.set(product.collection(`Members`).doc(user.uid).withConverter(genAdminConverter(MemberSchema)), {
					avatar: userAvatar,
					name: userName,
					type: `owner`,
					id: user.uid,
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
					updates: {
						changed: {
							description: ``,
							updatedAt: new Date().toISOString(),
						},
						change: {
							description: ``,
							updatedAt: new Date().toISOString(),
						},
						impact: {
							description: ``,
							updatedAt: new Date().toISOString(),
						},
					},
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `One`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `Two`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `Three`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `Four`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `Five`,
					statement: ``,
				})
				batch.set(product.collection(`Objectives`).doc(nanoid()).withConverter(genAdminConverter(ObjectiveSchema)), {
					name: `Six`,
					statement: ``,
				})
				await batch.commit()

				return {productId: slug}
			},
		),

	getMemberEmails: procedure
		.input(
			z.object({
				productId: z.string(),
				userIdToken: z.string(),
			}),
		)
		.query(async ({input: {productId, userIdToken}}) => {
			const user = await authAdmin.verifyIdToken(userIdToken)
			const member = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.collection(`Members`)
				.doc(user.uid)
				.withConverter(genAdminConverter(MemberSchema))
				.get()
			if (member.data()?.type !== `owner`) throw new TRPCError({code: `UNAUTHORIZED`})

			const members = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.collection(`Members`)
				.withConverter(genAdminConverter(MemberSchema))
				.get()
			const emails: Record<string, string> = {}
			await Promise.all(
				members.docs.map(async (member) => {
					const user = await dbAdmin
						.collection(`Users`)
						.doc(member.id)
						.withConverter(genAdminConverter(UserSchema))
						.get()
					emails[member.id] = user.data()!.email
				}),
			)
			return emails
		}),

	haltAndCatchFire: procedure
		.input(
			z.object({
				productId: z.string(),
				userIdToken: z.string(),
			}),
		)
		.mutation(async ({input: {productId, userIdToken}}) => {
			const user = await authAdmin.verifyIdToken(userIdToken)
			const member = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.collection(`Members`)
				.doc(user.uid)
				.withConverter(genAdminConverter(MemberSchema))
				.get()
			if (member.data()?.type !== `owner`) throw new TRPCError({code: `UNAUTHORIZED`})

			await dbAdmin.recursiveDelete(
				dbAdmin.collection(`Products`).doc(productId).withConverter(genAdminConverter(ProductSchema)),
			)
		}),

	inviteUser: procedure
		.input(
			z.object({
				email: z.string().email(),
				productId: z.string(),
				userIdToken: z.string(),
				userType: z.string(),
			}),
		)
		.mutation(async ({input: {email, productId, userIdToken, userType}}) => {
			const user = await authAdmin.verifyIdToken(userIdToken)
			const member = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.collection(`Members`)
				.doc(user.uid)
				.withConverter(genAdminConverter(MemberSchema))
				.get()
			const memberData = member.data()
			invariant(memberData)
			const product = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.withConverter(genAdminConverter(ProductSchema))
				.get()
			const productData = product.data()
			invariant(productData)

			const inviteToken = crypto.randomBytes(16).toString(`hex`)
			await product.ref.collection(`Invites`).doc(inviteToken).withConverter(genAdminConverter(InviteSchema)).set({
				email,
				id: inviteToken,
				userType,
				status: `pending`,
			})

			const queryParams = querystring.stringify({invite_token: inviteToken})
			const inviteLink = `https://web.sprintzero.app/sign-in?${queryParams}`
			await sendEmail({
				to: email,
				from: `no-reply@sprintzero.app`,
				subject: `SprintZero | Member Invite`,
				body: `<b>${memberData.name}</b> has invited you to join the product <b>"${productData.name}"</b>.<br><br><a href="${inviteLink}">Accept Invitation</a>`,
			})
		}),

	inviteReminder: procedure
		.input(
			z.object({
				email: z.string().email(),
				productId: z.string(),
				userIdToken: z.string(),
			}),
		)
		.mutation(async ({input: {email, productId, userIdToken}}) => {
			const user = await authAdmin.verifyIdToken(userIdToken)
			const member = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.collection(`Members`)
				.doc(user.uid)
				.withConverter(genAdminConverter(MemberSchema))
				.get()
			const memberData = member.data()
			invariant(memberData)
			const product = await dbAdmin
				.collection(`Products`)
				.doc(productId)
				.withConverter(genAdminConverter(ProductSchema))
				.get()
			const productData = product.data()
			invariant(productData)

			const inviteToken = crypto.randomBytes(16).toString(`hex`)

			const queryParams = querystring.stringify({invite_token: inviteToken})
			const inviteLink = `https://web.sprintzero.app/sign-in?${queryParams}`
			await sendEmail({
				to: email,
				from: `no-reply@sprintzero.app`,
				subject: `SprintZero | Member Invite`,
				body: `<b>${memberData.name}</b> has invited you to join the product <b>"${productData.name}"</b>.<br><br><a href="${inviteLink}">Accept Invitation</a>`,
			})
		}),
})
