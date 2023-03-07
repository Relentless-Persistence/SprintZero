import {AppleFilled, NotificationOutlined, SettingOutlined} from "@ant-design/icons"
import {Button, Card, DatePicker, Dropdown, Skeleton} from "antd"
import dayjs from "dayjs"
import isBetween from "dayjs/plugin/isBetween"
import {doc, updateDoc} from "firebase/firestore"
import {random} from "lodash"
import {useState} from "react"

import type {Dayjs} from "dayjs"
import type {FC} from "react"

import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"
import {useUser} from "~/utils/useUser"
import ShuffleIcon from "~public/icons/shuffle.svg"
import SpotifyIcon from "~public/icons/spotify.svg"

dayjs.extend(isBetween)

const FunCard: FC = () => {
	const user = useUser()
	const [date, setDate] = useState<Dayjs | null>(null)
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const [showSong, setShowSong] = useState(false)

	const generateRandomDate = () => {
		const randomYear = Math.floor(random(1960, 2020))
		const randomMonth = Math.floor(random(0, 11))
		const randomDate = Math.floor(random(1, dayjs(`${randomYear}-${randomMonth + 1}`).daysInMonth()))

		// Output the random date in ISO format
		setDate(dayjs(`${randomYear}-${randomMonth}-${randomDate}`))
	}

	const {data: song, isSuccess: songIsSuccess} = trpc.gpt.useQuery(
		{
			prompt: `What was the #1 song on the Billboard Top 100 list on ${
				date?.format(`MMMM D, YYYY`) ?? ``
			}? Give in the format "Artist - Song name".`,
		},
		{
			enabled: !!date && !hasSubmitted,
			select: (data) => data.response?.replace(/^"/, ``).replace(/"$/, ``),
		},
	)
	const clues = trpc.gpt.useQuery(
		{
			prompt: `I'm playing a song guessing game. Generate three clues for the song "${encodeURIComponent(
				song!,
			)}". Make sure no names or song/album titles are used in any of the clues. Also try not to quote any lyrics from the song.`,
		},
		{
			enabled: songIsSuccess,
			select: (data) =>
				data.response
					?.split(`\n`)
					.map((s) => s.replace(/^[0-9]+\. */, ``))
					.filter((s) => s !== ``),
		},
	)
	const {data: songUrl} = trpc.funCard.getSongUrl.useQuery(
		{
			song: song!,
			service: user?.data().preferredMusicClient ?? `appleMusic`,
		},
		{
			enabled: !!song && !!user,
			select: (data) => {
				if (!data.url) return undefined
				if (user!.data().preferredMusicClient === `appleMusic`) {
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
		setHasSubmitted(false)
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
				user && (
					<Dropdown
						trigger={[`click`]}
						placement="bottomRight"
						menu={{
							selectable: true,
							selectedKeys: [user.data().preferredMusicClient],
							items: [
								{
									key: `apple`,
									label: (
										<div
											className="flex items-center gap-2"
											onClick={() => {
												updateDoc(doc(db, `Users`, user.id).withConverter(UserConverter), {
													preferredMusicClient: `appleMusic`,
												}).catch(console.error)
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
												updateDoc(doc(db, `Users`, user.id).withConverter(UserConverter), {
													preferredMusicClient: `spotify`,
												}).catch(console.error)
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
				)
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
							disabled={clues.isSuccess}
							className="flex items-center gap-2"
							onClick={generateRandomDate}
						>
							Randomize
						</Button>
						<div className="space-x-2 text-right">
							<Button type="text" size="small" disabled={date === null} onClick={onReset}>
								Reset
							</Button>
							<Button size="small" onClick={() => setHasSubmitted(true)} disabled={date === null || clues.isSuccess}>
								Submit
							</Button>
						</div>
					</div>
				</div>

				<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
					<p className="font-semibold">Clues</p>
					{clues.isSuccess && clues.data ? (
						<ol className="w-full list-decimal space-y-1 pl-4">
							{clues.data.map((clue, i) => (
								<li key={i}>{clue}</li>
							))}
						</ol>
					) : hasSubmitted ? (
						<Skeleton active />
					) : (
						<Skeleton />
					)}
				</div>

				<div className="flex flex-col gap-2">
					<p className="font-semibold">Answer</p>
					{user && showSong ? (
						user.data().preferredMusicClient === `appleMusic` ? (
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
