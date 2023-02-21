import {NotificationOutlined} from "@ant-design/icons"
import {Avatar, Button, Card, DatePicker, Skeleton} from "antd"
import axios from "axios"
import dayjs from "dayjs"
import Image from "next/image"
import {useState} from "react"
import {z} from "zod"

import type {FC} from "react"

interface Result {
	results: {
		songs: {
			data: Song[]
		}
	}
}

interface Song {
	attributes: {
		url: string
	}
}

const FunCard: FC = () => {
	const [date, setDate] = useState<dayjs.Dayjs | null>(null)
	const [clues, setClues] = useState<string[] | null>(null)
	const [songUrl, setSongUrl] = useState(``)
	const [showSong, setShowSong] = useState(false)
	const [loading, setLoading] = useState(false)

	const dateFormat = `MMMM DD, YYYY`

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
		setLoading(true)

		if (date === null) {
			return
		}

		const formattedDate = date.format(`MMMM D, YYYY`)
		const gptQuestion = `What was the #1 song on the Billboard Top 100 list on ${formattedDate}? Give in the format "Song name - Artist".`
		const res = await axios.post(`/api/gpt`, {prompt: gptQuestion})

		const {response} = z.object({response: z.string()}).parse(res.data)

		await getClues(response)
		setLoading(false)
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
		const res = await axios.post<Result>(`/api/fetchSong`, {
			song: encodeURIComponent(newString),
		})
		const oldUrl = res.data.results.songs.data[0].attributes.url
		const domainIndex = oldUrl.indexOf(`music.apple.com`)
		const newUrl = `https://embed.${oldUrl.slice(domainIndex)}`
		setSongUrl(newUrl)
	}

	const onReset = () => {
		setDate(null)
		setClues(null)
		setSongUrl(``)
		setShowSong(false)
	}

	return (
		<Card
			className=""
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
		>
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

			<div className="mt-4 space-y-2">
				<p className="font-semibold">Clues</p>

				{clues && clues.length > 0 ? (
					<ol className="w-full list-decimal space-y-1 pl-4">
						{clues.map((clue: string, i: number) => (
							<li key={i}>{clue}</li>
						))}
					</ol>
				) : (
					<Skeleton active={loading} />
				)}
			</div>

			<div className="mt-4 space-y-3">
				<p className="font-semibold">Answer</p>
				<div>
					{showSong ? (
						<iframe
							allow="autoplay *; encrypted-media *;"
							height="190"
							style={{width: `100%`, maxWidth: `660px`, background: `transparent`}}
							sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
							src={songUrl}
						></iframe>
					) : (
						<Button block disabled={songUrl === ``} onClick={() => setShowSong(true)}>
							Reveal
						</Button>
					)}
				</div>
			</div>
		</Card>
	)
}

export default FunCard
