import {Configuration, OpenAIApi} from "openai"

import type {NextApiHandler} from "next"

const configuration = new Configuration({
	// organization: process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION,
	apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const handler: NextApiHandler = async (req, res) => {
	const {prompt} = req.body

	try {
		const response = await openai.createCompletion({
			model: `text-davinci-003`,
			prompt,
			temperature: 0.7,
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
