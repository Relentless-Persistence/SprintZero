import {TRPCError} from "@trpc/server"
import nodemailer from "nodemailer"
import {Configuration, OpenAIApi} from "openai"
import invariant from "tiny-invariant"
import {z} from "zod"

import type {WithFieldValue} from "firebase-admin/firestore"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import {funCardRouter} from "./funCard"
import {userInviteRouter} from "./userInvite"
import {procedure, router} from "../trpc"
import {dbAdmin} from "~/utils/firebaseAdmin"

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const appRouter = router({
	userInvite: userInviteRouter,
	funCard: funCardRouter,

	gpt: procedure.input(z.object({prompt: z.string()})).query(async ({input: {prompt}}) => {
		const response = await openai.createCompletion({
			model: `text-davinci-003`,
			prompt,
			temperature: 0.8,
			max_tokens: 3000,
			top_p: 0.8,
			frequency_penalty: 1,
			presence_penalty: 0,
		})
		return {
			response: response.data.choices[0]?.text,
		}
	}),
	migrateSchema: procedure.mutation(async () => {
		const storyMapStates = await dbAdmin.collection(`StoryMapStates`).get()

		await Promise.all([
			...storyMapStates.docs.map(async (doc) => {
				const items = z.record(z.string(), z.unknown()).parse(doc.data().items)
				const oldItemSchema = z.object({
					ethicsVotes: z.array(
						z.object({
							userId: z.string(),
							vote: z.boolean(),
						}),
					),
				})

				let updates: WithFieldValue<Partial<StoryMapItem>> = {}
				for (const itemId in items) {
					const item = oldItemSchema.safeParse(items[itemId])
					if (!item.success) continue
					let newEthicsVotes: StoryMapItem[`ethicsVotes`] = {}
					for (const vote of item.data.ethicsVotes) {
						newEthicsVotes[vote.userId] = vote.vote
					}
					// @ts-ignore - Complex
					updates[`items.${itemId}.ethicsVotes`] = newEthicsVotes
				}

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
