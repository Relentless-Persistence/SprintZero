import axios from "axios"
import {z} from "zod"

import type {NextApiHandler, NextApiRequest, NextApiResponse} from "next"

type GitLabBranch = {
	name: string
	commit: {
		id: string
		short_id: string
		title: string
		author_name: string
		author_email: string
		created_at: string
		message: string
	}
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	const {accessToken, projectId} = z
		.object({accessToken: z.string(), projectId: z.string()})
		.parse(req.body)

    const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/branches`

		try {
			const response = await axios.get<GitLabBranch[]>(url, {
				headers: {
					"Private-Token": accessToken,
				},
			})

			res.status(200).json(response.data)
		} catch (error) {
			res.status(400).send(error || `Something went wrong`)
		}
}

export default handler
