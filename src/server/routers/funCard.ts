import axios from "axios"
import jwt from "jsonwebtoken"
import {z} from "zod"

import {procedure, router} from "../trpc"

const appleMusicPrivateKey = process.env.APPLE_MUSIC_KIT_PRIVATE_KEY?.replace(/\\n/g, `\n`) || ``
const appleMusicTeamId = process.env.APPLE_TEAM_ID
const appleMusicKeyId = process.env.APPLE_KEY_ID
const appleMusicToken: string = jwt.sign({}, appleMusicPrivateKey, {
	algorithm: `ES256`,
	expiresIn: `180d`,
	issuer: appleMusicTeamId,
	header: {
		alg: `ES256`,
		kid: appleMusicKeyId,
	},
})

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID || ``
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || ``
const spotifyBasicAuth = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString(`base64`)

export const funCardRouter = router({
	getSongUrl: procedure
		.input(z.object({songName: z.string(), service: z.enum([`appleMusic`, `spotify`])}))
		.query(async ({input: {songName, service}}) => {
			if (service === `appleMusic`) {
				const url = `https://api.music.apple.com/v1/catalog/us/search?types=songs&term=${songName}`

				const res = await axios.get<AppleMusicSearchResult>(url, {
					headers: {
						Authorization: `Bearer ${appleMusicToken}`,
					},
				})
				return {url: res.data.results.songs.data[0]?.attributes.url}
			} else {
				const token: string = await getSpotifyToken()

				const url = `https://api.spotify.com/v1/search?q=${songName}&type=track&market=ES&limit=1`

				const res = await axios.get<SpotifySearchResult>(url, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
				return {url: res.data.tracks.items[0]?.external_urls.spotify}
			}
		}),
})

type AppleMusicSearchResult = {
	results: {
		songs: {
			data: Array<{
				attributes: {
					url: string
				}
			}>
		}
	}
}

const getSpotifyToken = async (): Promise<string> => {
	const authOptions = {
		url: `https://accounts.spotify.com/api/token`,
		method: `post`,
		headers: {
			Authorization: `Basic ${spotifyBasicAuth}`,
			"Content-Type": `application/x-www-form-urlencoded`,
		},
		data: new URLSearchParams({
			grant_type: `client_credentials`,
		}),
	}

	try {
		const response = await axios<{access_token: string}>(authOptions)
		return response.data.access_token
	} catch (error) {
		console.error(error)
		throw new Error(`Failed to retrieve Spotify access token.`)
	}
}

type SpotifySearchResult = {
	tracks: {
		items: Array<{
			external_urls: {
				spotify: string
			}
		}>
	}
}
