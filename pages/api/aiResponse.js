import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  // organization: process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION,
	apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export default async function handler (req, res) {
  const {prompt} = req.body;
  console.log(prompt)

  try {
    const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt,
			temperature: 0,
			max_tokens: 3000,
			top_p: 1,
			frequency_penalty: 0.5,
			presence_penalty: 0,
		})
    res.status(200).json({
      bot: response.data.choices[0].text
    })
  } catch (error) {
    console.error(error)
		res.status(500).send(error || "Something went wrong")
  }

}