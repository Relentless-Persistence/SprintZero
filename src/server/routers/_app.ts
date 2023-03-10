import {Configuration, OpenAIApi} from "openai"
import {z} from "zod"

import type {WithFieldValue} from "firebase-admin/firestore"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import {funCardRouter} from "./funCard"
import {productRouter} from "./product"
import {userInviteRouter} from "./userInvite"
import {procedure, router} from "../trpc"
import {dbAdmin} from "~/utils/firebaseAdmin"

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const appRouter = router({
	funCard: funCardRouter,
	product: productRouter,
	userInvite: userInviteRouter,

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
})

export type AppRouter = typeof appRouter
