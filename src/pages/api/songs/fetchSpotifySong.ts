import axios from "axios"

import type {NextApiHandler, NextApiRequest, NextApiResponse} from "next"

const clientId = process.env.SPOTIFY_CLIENT_ID || ``
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || ``
const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(`base64`)

interface SongRequest {
	song: string
}

interface TokenResponse {
	data: {
		access_token: string
	}
}

const getToken = async (): Promise<string> => {
	const authOptions = {
		url: `https://accounts.spotify.com/api/token`,
		method: `post`,
		headers: {
			Authorization: `Basic ${basicAuth}`,
			"Content-Type": `application/x-www-form-urlencoded`,
		},
		data: new URLSearchParams({
			grant_type: `client_credentials`,
		}),
	}

	try {
		const response: TokenResponse = await axios(authOptions)
		return response.data.access_token
	} catch (error) {
		console.error(error)
		throw new Error(`Failed to retrieve Spotify access token.`)
	}
}

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	const token: string = await getToken()
	const {song} = req.body as SongRequest

	const url = `https://api.spotify.com/v1/search?q=${song}&type=track&market=ES&limit=1`

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
