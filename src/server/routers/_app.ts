import { Configuration, OpenAIApi } from "openai"
import { z } from "zod"

import { funCardRouter } from "./funCard"
import { productRouter } from "./product"
import { userInviteRouter } from "./userInvite"
import { procedure, router } from "../trpc"
import { ChatRole } from "~/app/(authenticated)/[productSlug]/(product)/userbase/practice/types"
import { dbAdmin } from "~/utils/firebaseAdmin"

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const appRouter = router({
	funCard: funCardRouter,
	product: productRouter,
	userInvite: userInviteRouter,

	gpt: procedure.input(z.object({ prompt: z.string() })).mutation(async ({ input: { prompt } }) => {
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
	gptChat35: procedure.input(z.object({
		chatConversation: z.array(z.object({
			role: z.nativeEnum(ChatRole),
			content: z.string()
		}))
	})).mutation(async ({ input: { chatConversation } }) => {
		const response = await openai.createChatCompletion({
			model: `gpt-3.5-turbo`,
			messages: chatConversation
		})
		return {
			response: response.data.choices[0]?.message?.content,
		}
	}),
	gptChat4: procedure.input(z.object({
		chatConversation: z.array(z.object({
			role: z.nativeEnum(ChatRole),
			content: z.string()
		}))
	})).mutation(async ({ input: { chatConversation } }) => {
		const response = await openai.createChatCompletion({
			model: `gpt-4`,
			messages: chatConversation,
			//stream: true
		})
		return {
			response: response.data.choices[0]?.message?.content,
		}
	}),
	gpt4: procedure.input(z.object({ prompt: z.string() })).mutation(async ({ input: { prompt } }) => {
		const response = await openai.createChatCompletion({
			model: `gpt-4`,
			messages: [{ "role": `assistant`, "content": prompt }],
			//prompt,
			// temperature: 0.8,
			// max_tokens: 3000,
			// top_p: 0.8,
			// frequency_penalty: 1,
			// presence_penalty: 0,
		})
		return {
			response: response.data.choices[0]?.message?.content
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
