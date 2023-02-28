import {Configuration, OpenAIApi} from "openai"
import {z} from "zod"

import type {NextApiHandler} from "next"

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const handler: NextApiHandler = async (req, res) => {
	const {prompt} = z.object({prompt: z.string()}).parse(req.body)
	try {
		const response = await openai.createCompletion({
			model: `text-davinci-003`,
			prompt,
			temperature: 0.8,
			max_tokens: 3000,
			top_p: 0.8,
			frequency_penalty: 1,
			presence_penalty: 0,
		})
		res.status(200).json({
			response: response.data.choices[0]?.text,
		})
	} catch (error) {
		console.error(error)
		res.status(500).send(error || `Something went wrong`)
	}
}

export default handler
