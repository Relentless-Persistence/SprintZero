import {AppleFilled, NotificationOutlined, SettingOutlined} from "@ant-design/icons"
import {Button, Card, DatePicker, Dropdown, Empty, Skeleton} from "antd"
import axios from "axios"
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import {random} from "lodash"
import {useState} from "react"
import {z} from "zod"

import type {Dayjs} from "dayjs"
import type {FC} from "react"

import ShuffleIcon from "~/public/images/shuffle.svg"
import SpotifyIcon from "~/public/images/spotify-icon.svg"

dayjs.extend(isBetween)

const FunCard: FC = () => {
	const [date, setDate] = useState<Dayjs | null>(null)
	const [clues, setClues] = useState<string[] | `loading` | undefined>(undefined)
	const [musicClient, setMusicClient] = useState<`apple` | `spotify`>(`apple`)
	const [songUrl, setSongUrl] = useState<string | undefined>(undefined)
	const [showSong, setShowSong] = useState(false)

	const generateRandomDate = () => {
		const randomYear = Math.floor(random(1960, 2020))
		const randomMonth = Math.floor(random(0, 11))
		const randomDate = Math.floor(random(1, dayjs(`${randomYear}-${randomMonth + 1}`).daysInMonth()))

		// Output the random date in ISO format
		setDate(dayjs(`${randomYear}-${randomMonth}-${randomDate}`))
	}

	const getSongString = async () => {
		if (!date) return
		setClues(`loading`)

		const gptQuestion = `What was the #1 song on the Billboard Top 100 list on ${date.format(
			`MMMM D, YYYY`,
		)}? Give in the format "Artist - Song name".`
		const res = await axios.post(`/api/gpt`, {prompt: gptQuestion})
		const {response} = z.object({response: z.string()}).parse(res.data)

		await Promise.all([getClues(response), getSong(response)])
	}

	const getClues = async (song: string) => {
		const gptQuestion = `I'm playing a song guessing game. Generate three clues for the song "${song}". Make sure no names or song/album titles are used in any of the clues. Also try not to quote any lyrics from the song.`
		const res = await axios.post(`/api/gpt`, {prompt: gptQuestion})
		const {response} = z.object({response: z.string()}).parse(res.data)
		const clues = response
			.split(`\n`)
			.map((s) => s.replace(/^[0-9]+\. */, ``))
			.filter((s) => s !== ``)
		setClues(clues)
	}

	const getSong = async (songString: string) => {
		const newString = songString.replace(/^"/, ``).replace(/"$/, ``)

		if (musicClient === `apple`) {
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
			const newUrl = `https://open.spotify.com/embed/track/${trackId}`
			setSongUrl(newUrl)
		}
	}

	const onReset = () => {
		setClues(undefined)
		setSongUrl(undefined)
		setShowSong(false)
	}

	return (
		<Card
			type="inner"
			className="flex flex-col [&>.ant-card-body]:grow"
			title={
				<div className="flex items-center gap-4 py-4">
					<div className="grid h-10 w-10 place-items-center rounded-md border border-primary bg-primaryBg">
						<NotificationOutlined className="text-xl" />
					</div>
					<div>
						<p>Fun Board</p>
						<p className="text-sm font-normal text-textTertiary">#1 song on this day in history</p>
					</div>
				</div>
			}
			extra={
				<Dropdown
					trigger={[`click`]}
					placement="bottomRight"
					menu={{
						selectable: true,
						selectedKeys: [musicClient],
						items: [
							{
								key: `apple`,
								label: (
									<div
										className="flex items-center gap-2"
										onClick={() => {
											onReset()
											setMusicClient(`apple`)
										}}
									>
										<AppleFilled />
										<span>Apple Music</span>
									</div>
								),
							},
							{
								key: `spotify`,
								label: (
									<div
										className="flex items-center gap-2"
										onClick={() => {
											onReset()
											setMusicClient(`spotify`)
										}}
									>
										<SpotifyIcon /> <span>Spotify</span>
									</div>
								),
							},
						],
					}}
				>
					<SettingOutlined className="text-lg" />
				</Dropdown>
			}
		>
			<div className="flex h-full flex-col gap-4">
				<div className="flex flex-col gap-2">
					<p className="font-semibold">Pick any date prior to January 1, 2021</p>
					<DatePicker
						value={date}
						format="MMMM D, YYYY"
						disabledDate={(date) => !date.isBetween(`1960-01-01`, `2020-12-31`, undefined, `[]`)}
						className="w-full"
						onChange={(date) => setDate(date)}
					/>

					<div className="flex items-center justify-between">
						<Button
							size="small"
							icon={<ShuffleIcon />}
							disabled={clues !== undefined}
							className="flex items-center gap-2"
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
								disabled={date === null || clues !== undefined}
							>
								Submit
							</Button>
						</div>
					</div>
				</div>

				<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
					<p className="font-semibold">Clues</p>
					{Array.isArray(clues) ? (
						<ol className="w-full list-decimal space-y-1 pl-4">
							{clues.map((clue, i) => (
								<li key={i}>{clue}</li>
							))}
						</ol>
					) : clues === `loading` ? (
						<Skeleton active />
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />
					)}
				</div>

				<div className="flex flex-col gap-2">
					<p className="font-semibold">Answer</p>
					{showSong ? (
						musicClient === `apple` ? (
							<iframe
								allow="autoplay *; encrypted-media *;"
								height="192"
								style={{width: `100%`, maxWidth: `660px`, background: `transparent`}}
								sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
								src={songUrl}
							/>
						) : (
							<iframe
								style={{borderRadius: `12px`}}
								src={songUrl}
								width="100%"
								height="112"
								allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
								loading="lazy"
							/>
						)
					) : (
						<Button block disabled={songUrl === undefined} onClick={() => setShowSong(true)}>
							Reveal
						</Button>
					)}
				</div>
			</div>
		</Card>
	)
}

export default FunCard

type AppleResult = {
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

type SpotifyResult = {
	tracks: {
		items: Array<{
			external_urls: {
				spotify: string
			}
		}>
	}
}
