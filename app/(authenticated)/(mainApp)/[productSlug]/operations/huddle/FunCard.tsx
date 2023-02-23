import {AppleFilled, NotificationOutlined, SettingOutlined} from "@ant-design/icons"
import {Avatar, Button, Card, DatePicker, Dropdown, Empty} from "antd"
import axios from "axios"
import dayjs from "dayjs"
import Image from "next/image"
import {useState} from "react"
import {z} from "zod"

import type {MenuProps} from "antd"
import type {FC} from "react"

import SpotifyIcon from "./SpotifyIcon"
interface AppleResult {
	results: {
		songs: {
			data: Song[]
		}
	}
}

interface SpotifyResult {
	tracks: {
		items: SpotifySong[]
	}
}

interface Song {
	attributes: {
		url: string
	}
}

interface SpotifySong {
	external_urls: {
		spotify: string
	}
}

const FunCard: FC = () => {
	const [date, setDate] = useState<dayjs.Dayjs | null>(null)
	const [clues, setClues] = useState<string[] | null>(null)
	const [songClient, setSongClient] = useState(`apple`)
	const [songUrl, setSongUrl] = useState(``)
	const [showSong, setShowSong] = useState(false)

	const dateFormat = `MMMM DD, YYYY`

	const items: MenuProps["items"] = [
		{
			key: `1`,
			label: (
				<div
					className="flex items-center space-x-[8px]"
					onClick={() => {
						onReset()
						setSongClient(`apple`)
					}}
				>
					<AppleFilled style={{color: `rgba(0, 0, 0, 0.45)`}} /> <span>Apple Music</span>
				</div>
			),
		},
		{
			key: `2`,
			label: (
				<div
					className="flex items-center space-x-[6px]"
					onClick={() => {
						onReset()
						setSongClient(`spotify`)
					}}
				>
					<SpotifyIcon /> <span>Spotify</span>
				</div>
			),
		},
	]

	const generateRandomDate = () => {
		const currentYear = new Date().getFullYear()
		const randomYear = Math.floor(Math.random() * (currentYear - 1960 + 1) + 1960)
		const randomMonth = Math.floor(Math.random() * 12)
		const randomDay = Math.floor(Math.random() * new Date(randomYear, randomMonth + 1, 0).getDate() + 1)
		const randomDate = new Date(randomYear, randomMonth, randomDay)

		// Output the random date in ISO format
		setDate(dayjs(randomDate))
	}

	const getSongString = async () => {
		if (date === null) {
			return
		}

		const formattedDate = date.format(`MMMM D, YYYY`)
		const gptQuestion = `What was the #1 song on the Billboard Top 100 list on ${formattedDate}? Give in the format "Artist - Song name".`
		const res = await axios.post(`/api/gpt`, {prompt: gptQuestion})

		const {response} = z.object({response: z.string()}).parse(res.data)

		await getClues(response)
		await getSong(response)
	}

	const getClues = async (song: string) => {
		const gptQuestion = `I'm playing a song guessing game. Generate three clues for the song "${song}" . Make sure no names or song/album titles are used in any of the clues.`
		const res = await axios.post(`/api/gpt`, {prompt: gptQuestion})

		const {response} = z.object({response: z.string()}).parse(res.data)
		const newClues: string[] = response
			.split(`\n`)
			.map((s) => s.replace(/^[0-9]+\. */, ``))
			.filter((s) => s !== ``)
		setClues(newClues)
	}

	const getSong = async (songString: string) => {
		const newString = songString.replace(/^"/, ``).replace(/"$/, ``)

		if (songClient === `apple`) {
			const res = await axios.post<AppleResult>(`/api/songs/fetchAppleSong`, {
				song: encodeURIComponent(newString),
			})
			const oldUrl = res.data.results.songs.data[0]?.attributes.url
			if (!oldUrl) return
			const domainIndex = oldUrl.indexOf(`music.apple.com`)
			const newUrl = `https://embed.${oldUrl.slice(domainIndex)}`
			setSongUrl(newUrl)
		} else {
			const res = await axios.post<SpotifyResult>(`/api/songs/fetchSpotifySong`, {
				song: encodeURIComponent(newString),
			})

			const oldUrl = res.data.tracks.items[0]?.external_urls.spotify
			if (!oldUrl) return
			const trackId = oldUrl.slice(oldUrl.lastIndexOf(`/`) + 1)
			const newUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`
			setSongUrl(newUrl)
		}
	}

	const onReset = () => {
		setDate(null)
		setClues(null)
		setSongUrl(``)
		setShowSong(false)
	}

	return (
		<Card
			size="small"
			type="inner"
			title={
				<div className="my-4 flex items-center gap-4">
					<Avatar
						shape="square"
						icon={<NotificationOutlined style={{color: `rgba(0, 0, 0, 0.45)`}} />}
						size="large"
						style={{backgroundColor: `#DDE3D5`, border: `1px solid #A7C983`}}
					/>
					<div>
						<p>Fun Board</p>
						<p className="text-[rgba(0, 0, 0, 0.45)] text-xs font-light">#1 song on this day in history</p>
					</div>
				</div>
			}
			extra={
				<Dropdown
					menu={{
						items,
					}}
					trigger={[`click`]}
				>
					<SettingOutlined />
				</Dropdown>
			}
		>
			<div className="flex flex-col">
				<div className="space-y-2">
					<p className="font-semibold">Pick any date prior to today</p>
					<DatePicker
						value={date}
						onChange={(date) => setDate(date)}
						format={dateFormat}
						className="w-full"
						placeholder="1982-02-13"
					/>

					<div className="flex items-center justify-between">
						<Button
							size="small"
							style={{width: `113px`}}
							icon={<Image src="/images/shuffle.svg" alt="shuffle" width={16} height={16} />}
							className="flex items-center justify-between"
							onClick={generateRandomDate}
						>
							Randomize
						</Button>
						<div className="space-x-2 text-right">
							<Button type="link" disabled={date === null} onClick={onReset}>
								Reset
							</Button>
							<Button
								size="small"
								onClick={() => {
									getSongString().catch(console.error)
								}}
								disabled={date === null}
							>
								Submit
							</Button>
						</div>
					</div>
				</div>

				<div className="mt-4 min-h-[226px] space-y-2">
					<p className="font-semibold">Clues</p>

					{clues && clues.length > 0 ? (
						<ol className="w-full list-decimal space-y-1 pl-4">
							{clues.map((clue: string, i: number) => (
								<li key={i}>{clue}</li>
							))}
						</ol>
					) : (
						<div className="flex h-[226px] items-center justify-center">
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
						</div>
					)}
				</div>

				<div className="mt-4 w-full space-y-3">
					<p className="font-semibold">Answer</p>
					<div className="">
						{showSong ? (
							songClient === `apple` ? (
								<iframe
									allow="autoplay *; encrypted-media *;"
									height="192"
									style={{width: `100%`, maxWidth: `660px`, background: `transparent`}}
									sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
									src={songUrl}
								></iframe>
							) : (
								<iframe
									style={{borderRadius: `12px`}}
									src={songUrl}
									width="100%"
									height="112"
									allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
									loading="lazy"
								></iframe>
							)
						) : (
							<Button block disabled={songUrl === ``} onClick={() => setShowSong(true)}>
								Reveal
							</Button>
						)}
					</div>
				</div>
			</div>
		</Card>
	)
}

export default FunCard
