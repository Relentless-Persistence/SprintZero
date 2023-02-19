import {NotificationOutlined} from "@ant-design/icons"
import {Avatar, Button, Card, DatePicker} from "antd"
import axios from "axios"
// import dayjs from "dayjs"
import Image from "next/image"
import {useState} from "react"
import {z} from "zod"

import type {DatePickerProps} from "antd"
import type {FC} from "react"

const FunCard: FC = () => {
	const [date, setDate] = useState(``)
	const [clues, setClues] = useState<string[] | null>(null)
	const [songUrl, setSongUrl] = useState<string>(``)

	const dateFormat = `YYYY-MM-DD`

	const onChange: DatePickerProps["onChange"] = (date, dateString) => {
		setDate(dateString)
	}

	const generateRandomDate = () => {
		const currentYear = new Date().getFullYear()
		const randomYear = Math.floor(Math.random() * (currentYear - 1920 + 1) + 1920)
		const randomMonth = Math.floor(Math.random() * 12)
		const randomDay = Math.floor(Math.random() * new Date(randomYear, randomMonth + 1, 0).getDate() + 1)
		const randomDate = new Date(randomYear, randomMonth, randomDay)

		// Output the random date in ISO format
		setDate(randomDate.toISOString().substring(0, 10))
	}

	const getSongString = async () => {
		const gptQuestion = `respond as an object {song, artist} the billboard artist and song of the #1 song in the United States on ${date}`
		const res = await axios.post(`/api/gpt`, {prompt: gptQuestion})

		const {response} = z.object({response: z.string()}).parse(res.data)

		await getClues(response)

		await getSong(response)
	}

	const getClues = async (song: string) => {
		const gptQuestion = `respond using only an array, list 3 clues for this song ${song}`

		const res = await axios.post(`/api/gpt`, {prompt: gptQuestion})

		const {response} = z.object({response: z.string()}).parse(res.data)
		const newClues: string[] = JSON.parse(response) as string[]
		setClues(newClues)
	}

	const getSong = async (songString: string) => {
    const newString = songString.trimStart().replace(/'/g, '"').replace(/(\w+:)|"|{|}/g, '').trim()
    const obj = newString
			.split(",")
			.map((s) => s.trim().replace(/ /g, "+"))
			.join("+")
    

		const res = await axios.post(`/api/fetchSong`, {song: obj})
    const oldUrl = res.data.results.songs.data[0].attributes.url
    const domainIndex = oldUrl.indexOf("music.apple.com")
		const newUrl = `https://embed.${oldUrl.slice(domainIndex)}`
		setSongUrl(newUrl)
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
		>
			<div className="space-y-2">
				<p className="font-semibold">Pick any date prior to today</p>
				<DatePicker
					// value={date}
					onChange={onChange}
					format={dateFormat}
					className="w-full"
					placeholder="1982-02-13"
				/>

				<div className="flex items-center justify-between">
					<Button
						size="small"
						icon={<Image src="/images/shuffle.svg" alt="shuffle" width={16} height={16} />}
						className="flex items-center justify-between"
						onClick={generateRandomDate}
					>
						Randomize
					</Button>
					<div className="space-x-2 text-right">
						<span>Reset</span>
						<Button size="small" onClick={getSongString}>
							Submit
						</Button>
					</div>
				</div>
			</div>

			<div className="mt-4 space-y-2">
				<p className="font-semibold">Clues</p>

				<ol className="w-full list-decimal space-y-1 pl-4">
					{clues && clues.map((clue: string, i: number) => <li key={i}>{clue}</li>)}
				</ol>
			</div>

			<div className="mt-4 space-y-2">
				<p className="font-semibold">Answer</p>
				<div>
					{/* <audio controls className="w-full" src={songUrl} /> */}
          <iframe
					allow="autoplay *; encrypted-media *;"
					height="450"
					style={{width: `100%`, maxWidth: `660px`, background: `transparent`}}
					sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
					src={songUrl}
				></iframe>
				</div>
				
			</div>
		</Card>
	)
}

export default FunCard
