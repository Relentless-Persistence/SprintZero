import { AppleFilled, NotificationOutlined, SettingOutlined } from "@ant-design/icons"
import { Button, Card, DatePicker, Dropdown, Segmented, Skeleton } from "antd"
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import { doc, updateDoc } from "firebase/firestore"
import { random } from "lodash"
import { useState } from "react"

import type { Dayjs } from "dayjs"
import type { FC } from "react"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { UserConverter } from "~/types/db/Users"
import { db } from "~/utils/firebase"
import { trpc } from "~/utils/trpc"
import ShuffleIcon from "~public/icons/shuffle.svg"
import SpotifyIcon from "~public/icons/spotify.svg"

dayjs.extend(isBetween)

const FunCard: FC = () => {
	const { user } = useAppContext()
	const [date, setDate] = useState<Dayjs | null>(null)
	const [songName, setSongName] = useState<string | undefined>(undefined)
	const [clues, setClues] = useState<string[] | undefined>(undefined)
	const [showSong, setShowSong] = useState(false)
	const [preferredMusicClient, setPreferredMusicClient] = useState(user.data().preferredMusicClient)

	const generateRandomDate = async () => {
		const randomYear = Math.floor(random(1960, 2020))
		const randomMonth = Math.floor(random(0, 11))
		const randomDate = Math.floor(random(1, dayjs(`${randomYear}-${randomMonth + 1}`).daysInMonth()))
		const date = dayjs(`${randomYear}-${randomMonth}-${randomDate}`)

		// Output the random date in ISO format
		setDate(dayjs(`${randomYear}-${randomMonth}-${randomDate}`))


		await songGpt
			.mutateAsync({
				prompt: `What was the #1 song on the Billboard Top 100 list on ${date.format(`MMMM D, YYYY`) ?? ``
					}? Give in the format "Artist - Song name".`,
			})
			.then(async (data) => {
				const song = data.response!.replace(/^"/, ``).replace(/"$/, ``).replaceAll(`\n`, ``)
				setSongName(song)

				const clues = (
					await cluesGpt.mutateAsync({
						prompt: `I'm playing a song guessing game. Generate three clues for the song "${song}". Make sure no names or song/album titles are used in any of the clues. Also try not to quote any lyrics from the song.`,
					})
				).response
					?.split(`\n`)
					.map((s) => s.replace(/^[0-9]+\. */, ``))
					.filter((s) => s !== ``)
				setClues(clues)
			})

	}

	const songGpt = trpc.gpt.useMutation()
	const cluesGpt = trpc.gpt.useMutation()
	const { data: songUrl } = trpc.funCard.getSongUrl.useQuery(
		{
			songName: encodeURIComponent(songName!),
			service: user.data().preferredMusicClient,
		},
		{
			enabled: !!songName && !!user,
			select: (data) => {
				if (!data.url) return undefined
				if (user.data().preferredMusicClient === `appleMusic`) {
					const domainIndex = data.url.indexOf(`music.apple.com`)
					return `https://embed.${data.url.slice(domainIndex)}`
				} else {
					const trackId = data.url.slice(data.url.lastIndexOf(`/`) + 1)
					return `https://open.spotify.com/embed/track/${trackId}`
				}
			},
		},
	)

	const onReset = () => {
		setSongName(undefined)
		setDate(null)
		setClues(undefined)
		setShowSong(false)
	}

	return (
		<Card
			type="inner"
			className="flex min-h-0 flex-col [&>.ant-card-body]:grow [&>.ant-card-body]:overflow-auto [&>.ant-card-head]:shrink-0"
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
				<Segmented
					options={[
						{
							value: `spotify`,
							icon: <SpotifyIcon color="#52C41A" className="mr-1.5 inline-block" />,
						},
						{
							value: `appleMusic`,
							icon: <AppleFilled style={{ color: `#F5222D` }} />,
						},
					]}
					value={preferredMusicClient}
					onChange={(newValue) => {
						const newMusicClient = newValue as "appleMusic" | "spotify";
						setPreferredMusicClient(newMusicClient);
						updateDoc(doc(db, `Users`, user.id), {
							preferredMusicClient: newMusicClient,
						}).catch(console.error);
					}}
				/>

				// <Dropdown
				// 	trigger={[`click`]}
				// 	placement="bottomRight"
				// 	menu={{
				// 		selectable: true,
				// 		selectedKeys: [user.data().preferredMusicClient],
				// 		items: [
				// 			{
				// 				key: `apple`,
				// 				label: (
				// 					<div
				// 						className="flex items-center gap-2"
				// 						onClick={() => {
				// 							updateDoc(doc(db, `Users`, user.id).withConverter(UserConverter), {
				// 								preferredMusicClient: `appleMusic`,
				// 							}).catch(console.error)
				// 						}}
				// 					>
				// 						<AppleFilled />
				// 						<span>Apple Music</span>
				// 					</div>
				// 				),
				// 			},
				// 			{
				// 				key: `spotify`,
				// 				label: (
				// 					<div
				// 						className="flex items-center gap-2"
				// 						onClick={() => {
				// 							updateDoc(doc(db, `Users`, user.id).withConverter(UserConverter), {
				// 								preferredMusicClient: `spotify`,
				// 							}).catch(console.error)
				// 						}}
				// 					>
				// 						<SpotifyIcon /> <span>Spotify</span>
				// 					</div>
				// 				),
				// 			},
				// 		],
				// 	}}
				// >
				// 	<SettingOutlined className="text-lg" />
				// </Dropdown>
			}
		>
			<div className="flex h-full flex-col gap-4">
				<div className="flex flex-col gap-2">
					<p className="font-semibold">Pick any date prior to January 1, 2021</p>
					<DatePicker
						value={date}
						format="MMMM D, YYYY"
						defaultPickerValue={dayjs(`2020-01-01`)}
						disabledDate={(date) => !date.isBetween(`1960-01-01`, `2020-12-31`, undefined, `[]`)}
						className="w-full"
						onChange={(date) => setDate(date)}
					/>

					<div className="flex items-center justify-between">
						<Button
							size="small"
							icon={<ShuffleIcon />}
							disabled={!!songName || songGpt.isLoading}
							className="flex items-center gap-2"
							onClick={() => {
								generateRandomDate().catch(console.error)
							}}
						>
							Randomize
						</Button>
						<div className="space-x-2 text-right">
							<Button type="text" size="small" disabled={date === null || cluesGpt.isLoading} onClick={onReset}>
								Reset
							</Button>
							<Button
								size="small"
								loading={songGpt.isLoading || cluesGpt.isLoading}
								onClick={() => {
									songGpt
										.mutateAsync({
											prompt: `What was the #1 song on the Billboard Top 100 list on ${date?.format(`MMMM D, YYYY`) ?? ``
												}? Give in the format "Artist - Song name".`,
										})
										.then(async (data) => {
											const song = data.response!.replace(/^"/, ``).replace(/"$/, ``).replaceAll(`\n`, ``)
											setSongName(song)

											const clues = (
												await cluesGpt.mutateAsync({
													prompt: `I'm playing a song guessing game. Generate three clues for the song "${song}". Make sure no names or song/album titles are used in any of the clues. Also try not to quote any lyrics from the song.`,
												})
											).response
												?.split(`\n`)
												.map((s) => s.replace(/^[0-9]+\. */, ``))
												.filter((s) => s !== ``)
											setClues(clues)
										})
										.catch(console.error)
								}}
								disabled={date === null || songGpt.isLoading || songName !== undefined}
							>
								Submit
							</Button>
						</div>
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-2">
					<p className="font-semibold">Clues</p>
					{clues ? (
						<ol className="w-full list-decimal space-y-1 pl-4">
							{clues.map((clue, i) => (
								<li key={i}>{clue}</li>
							))}
						</ol>
					) : cluesGpt.isLoading || songGpt.isLoading ? (
						<Skeleton active />
					) : (
						<Skeleton />
					)}
				</div>

				<div className="flex flex-col gap-2">
					<p className="font-semibold">Answer</p>
					{showSong ? (
						user.data().preferredMusicClient === `appleMusic` ? (
							<iframe
								allow="autoplay *; encrypted-media *;"
								height="192"
								style={{ width: `100%`, maxWidth: `660px`, background: `transparent` }}
								sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
								src={songUrl}
							/>
						) : (
							<iframe
								style={{ borderRadius: `12px` }}
								src={songUrl}
								width="100%"
								height="112"
								allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
								loading="lazy"
							/>
						)
					) : (
						<Button block disabled={songUrl === undefined || clues === undefined} onClick={() => setShowSong(true)}>
							Reveal
						</Button>
					)}
				</div>
			</div>
		</Card>
	)
}

export default FunCard
