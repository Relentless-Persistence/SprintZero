import axios from "axios"
import {z} from "zod"

import type {NextApiHandler, NextApiRequest, NextApiResponse} from "next"

const API_KEY = process.env.PEXELS_API_KEY

interface PexelsPhoto {
	id: number
	width: number
	height: number
	url: string
	photographer: string
	photographer_url: string
	src: {
		original: string
		large2x: string
		large: string
		medium: string
		small: string
		portrait: string
		landscape: string
		tiny: string
	}
}

interface PexelsResponse {
	photos: PexelsPhoto[]
	total_results: number
	next_page?: string
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	const {q} = z.object({q: z.string()}).parse(req.body)

	try {
		const response = await axios.get<PexelsResponse>(`https://api.pexels.com/v1/search?query=${q}`, {
			headers: {
				Authorization: API_KEY,
			},
		})

		const photos = response.data.photos

		res.status(200).json(photos)
	} catch (error) {
		res.status(400).send(error || `Something went wrong`)
	}
}

export default handler
