import axios from "axios"
import jwt from "jsonwebtoken"

import type {NextApiHandler, NextApiRequest, NextApiResponse} from "next"

const privateKey = process.env.APPLE_MUSIC_KIT_PRIVATE_KEY?.replace(/\\n/g, `\n`) || ``
const teamId = process.env.APPLE_TEAM_ID
const keyId = process.env.APPLE_KEY_ID

const token: string = jwt.sign({}, privateKey, {
	algorithm: `ES256`,
	expiresIn: `180d`,
	issuer: teamId,
	header: {
		alg: `ES256`,
		kid: keyId,
	},
})

interface SongRequest {
	song: string
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	const {song} = req.body as SongRequest

	const url = `https://api.music.apple.com/v1/catalog/us/search?types=songs&term=${song}`

	await axios
		.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		.then((response) => {
			res.status(200).json(response.data)
		})
		.catch((error) => {
			res.status(400).send(error || `Something went wrong`)
		})
}

export default handler
