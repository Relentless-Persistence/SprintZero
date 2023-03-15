import {Configuration, OpenAIApi} from "openai"
import {z} from "zod"

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

	gpt: procedure.input(z.object({prompt: z.string()})).mutation(async ({input: {prompt}}) => {
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
		const users = await dbAdmin.collection(`Users`).get()
		// const storyMapItems = await dbAdmin.collectionGroup(`StoryMapItems`).get()
		const batch1 = dbAdmin.batch()
		users.forEach((user) => {
			batch1.update(user.ref, {
				type: `user`,
			})
		})
		await batch1.commit()
		// const batch = dbAdmin.batch()
		// storyMapItems.forEach((storyMapItem) => {
		// 	batch.update(storyMapItem.ref, {
		// 		id: storyMapItem.id,
		// 	})
		// })
		// await batch.commit()
	}),
})

export type AppRouter = typeof appRouter
