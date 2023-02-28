import axios from "axios"
import {z} from "zod"

import type {NextApiHandler, NextApiRequest, NextApiResponse} from "next"

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	const {accessToken, repoName, username} = z
		.object({accessToken: z.string(), repoName: z.string(), username: z.string()})
		.parse(req.body)

	try {
		const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}/branches`, {
			headers: {
				Authorization: `Token ${accessToken}`,
			},
		})

		res.status(200).json(response.data)
	} catch (error) {
		res.status(400).send(error || `Something went wrong`)
	}
}

export default handler
