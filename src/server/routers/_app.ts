import {TRPCError} from "@trpc/server"
import {Timestamp} from "firebase-admin/firestore"
import nodemailer from "nodemailer"
import invariant from "tiny-invariant"
import {z} from "zod"

import {userInviteRouter} from "./userInvite"
import {procedure, router} from "../trpc"
import {dbAdmin} from "~/utils/firebaseAdmin"

export const appRouter = router({
	userInvite: userInviteRouter,

	migrateSchema: procedure.mutation(async () => {
		const storyMapStates = await dbAdmin.collection(`StoryMapStates`).get()

		await Promise.all([
			...storyMapStates.docs.map(async (doc) => {
				const items = doc.data().items as unknown
				if (typeof items !== `object` || items === null) return
				const updates = Object.fromEntries(
					Object.entries(items)
						.filter(
							([, item]: [string, unknown]) =>
								typeof item === `object` && item !== null && `createdAt` in item && item.createdAt === null,
						)
						.map(([id]) => {
							return [`items.${id}.createdAt`, Timestamp.now()]
						}),
				)
				await dbAdmin.doc(doc.ref.path).update(updates)
			}),
		])
	}),
	sendEmail: procedure
		.input(
			z.object({
				body: z.string(),
				from: z.string(),
				subject: z.string(),
				to: z.string(),
			}),
		)
		.mutation(async ({input: {body, from, subject, to}}) => {
			if (process.env.NODE_ENV === `production`) {
				const emailFrom = process.env.EMAIL_FROM_NO_REPLY
				invariant(emailFrom, `EMAIL_FROM_NO_REPLY is not set`)
				const emailPassword = process.env.EMAIL_PASSWORD_NO_REPLY
				invariant(emailPassword, `EMAIL_PASSWORD_NO_REPLY is not set`)
				if (from !== process.env.EMAIL_FROM_NO_REPLY)
					throw new TRPCError({code: `BAD_REQUEST`, message: `Invalid from email`})

				const transporter = nodemailer.createTransport({
					service: `gmail`,
					auth: {
						user: emailFrom,
						pass: emailPassword,
					},
				})

				await transporter.sendMail({
					from,
					to,
					subject,
					html: body,
				})
			} else {
				console.info(`sendEmail`, {from, to, subject, body})
			}
		}),
})

export type AppRouter = typeof appRouter
