import {notification} from "antd"
import axios from "axios1"
import {z} from "zod"

type ProductVisionInput = {
	productType: string
	valueProposition: string
	features: string[]
}

export const generateProductVision = async ({
	productType,
	valueProposition,
	features,
}: ProductVisionInput): Promise<string> => {
	const gptQuestion = `Write a product vision for a ${productType} app. Its goal is to: ${valueProposition}. The app has the following features: ${features.join(
		`, `,
	)}.`

	let gptResponse = ``
	try {
		const _res = await axios.post(`/api/gpt`, {prompt: gptQuestion})
		const {response: res} = z.object({response: z.string()}).parse(_res.data)
		gptResponse = res.trimStart()
	} catch (error) {
		console.error(error)
		notification.error({message: `Something went wrong!`})
	}

	return gptResponse
}
