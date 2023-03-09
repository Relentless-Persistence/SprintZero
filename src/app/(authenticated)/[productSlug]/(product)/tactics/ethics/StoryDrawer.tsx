import {
	BlockOutlined,
	CodeOutlined,
	DislikeOutlined,
	DollarOutlined,
	FlagOutlined,
	LikeOutlined,
	LinkOutlined,
	NumberOutlined,
	UserOutlined,
} from "@ant-design/icons"
import {useQueries} from "@tanstack/react-query"
import {Avatar, Drawer, Input, Popover, Radio, Segmented, Tag} from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {doc, getDoc, updateDoc} from "firebase/firestore"
import {useEffect, useState} from "react"
import {useDocument} from "react-firebase-hooks/firestore"
import {useInterval} from "react-use"

import type {QueryDocumentSnapshot, QuerySnapshot, WithFieldValue} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {User} from "~/types/db/Users"

import {useProduct} from "~/app/(authenticated)/useProduct"
import Comments from "~/components/Comments"
import LinkTo from "~/components/LinkTo"
import {sprintColumns} from "~/types/db/Products/StoryMapItems"
import {UserConverter} from "~/types/db/Users"
import dollarFormat from "~/utils/dollarFormat"
import {db} from "~/utils/firebase"
import {getStories} from "~/utils/storyMap"
import {useUser} from "~/utils/useUser"

dayjs.extend(relativeTime)

export type StoryDrawerProps = {
	storyMapItems: QuerySnapshot<StoryMapItem>
	storyId: string
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({storyMapItems, storyId, isOpen, onClose}) => {
	const user = useUser()
	const product = useProduct()
	const story = getStories(storyMapItems).find((story) => story.id === storyId)!
	const [description, setDescription] = useState(story.data().description)
	const [commentType, setCommentType] = useState<`design` | `code`>(`design`)

	useEffect(() => {
		setDescription(story.data().description)
	}, [story])

	const addVote = async (vote: boolean) => {
		if (!user) return

		let votesFor = Object.values(story.data().ethicsVotes).filter((vote) => vote === true).length
		let votesAgainst = Object.values(story.data().ethicsVotes).filter((vote) => vote === false).length
		if (vote) votesFor++
		else votesAgainst++
		const votingComplete = votesFor + votesAgainst === Object.keys(product.data().members).length
		const votingResult = votesFor > votesAgainst

		if (votingComplete) {
			const data: WithFieldValue<Partial<StoryMapItem>> = {
				[`ethicsVotes.${user.id}`]: vote,
				ethicsApproved: votingResult,
				ethicsColumn: `adjudicated`,
			}
			await updateDoc(story.ref, data)
		} else {
			const data: WithFieldValue<Partial<StoryMapItem>> = {
				[`ethicsVotes.${user.id}`]: vote,
			}
			await updateDoc(story.ref, data)
		}
	}

	const totalEffort = story.data().designEffort + story.data().engineeringEffort

	const [lastModifiedText, setLastModifiedText] = useState<string | undefined>(undefined)
	useInterval(() => {
		setLastModifiedText(dayjs(story.data().updatedAt.toMillis()).fromNow())
	}, 1000)
	const [lastModifiedUser] = useDocument(doc(db, `Users`, story.data().updatedAtUserId).withConverter(UserConverter))

	const teamMembers = useQueries({
		queries: Object.keys(product.data().members).map((userId) => ({
			queryKey: [`user`, userId],
			queryFn: async () => await getDoc(doc(db, `Users`, userId).withConverter(UserConverter)),
		})),
	})

	const peoplePopoverItems = story
		.data()
		.peopleIds.map((userId) => teamMembers.find((user) => user.data?.id === userId)?.data)
		.filter((user): user is QueryDocumentSnapshot<User> => user?.exists() ?? false)
		.map((user) => (
			<div key={user.id} className="flex items-center gap-2 rounded bg-[#f0f0f0] p-2">
				<Avatar src={user.data().avatar} shape="square" size="small" />
				{user.data().name}
			</div>
		))

	return (
		<Drawer
			placement="bottom"
			closable={false}
			height={434}
			open={isOpen}
			onClose={() => onClose()}
			title={
				<div className="flex h-14 flex-col justify-center gap-1">
					<div className="flex items-end gap-4">
						<p>{story.data().name}</p>
						{lastModifiedText && lastModifiedUser?.exists() && (
							<p className="text-sm font-normal text-textTertiary">
								Last modified {lastModifiedText} by {lastModifiedUser.data().name}
							</p>
						)}
					</div>
					<div>
						<div className="relative flex gap-1">
							<Tag color="#585858" icon={<NumberOutlined />}>
								{totalEffort} point{totalEffort === 1 ? `` : `s`}
							</Tag>
							<Tag
								color={typeof product.data().effortCost === `number` ? `#585858` : `#f5f5f5`}
								icon={<DollarOutlined />}
								className={clsx(typeof product.data().effortCost !== `number` && `!border-current !text-[#d9d9d9]`)}
							>
								{dollarFormat((product.data().effortCost ?? 0) * totalEffort)}
							</Tag>
							<Tag color="#585858" icon={<FlagOutlined />}>
								{sprintColumns[story.data().sprintColumn]}
							</Tag>
							<Popover
								placement="bottom"
								content={
									<div className="-m-1 flex flex-col gap-2">
										{peoplePopoverItems.length > 0 ? (
											peoplePopoverItems
										) : (
											<p className="italic text-textTertiary">No people assigned to this story.</p>
										)}
									</div>
								}
							>
								<Tag color="#585858" icon={<UserOutlined />} className="text-sm">
									{story.data().peopleIds.length}
								</Tag>
							</Popover>

							<div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-1">
								<Tag
									color={story.data().branchName ? `#0958d9` : `#f5f5f5`}
									icon={<CodeOutlined />}
									style={story.data().branchName ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
								>
									{story.data().branchName ?? `No branch`}
								</Tag>
								<LinkTo href={story.data().designLink} openInNewTab>
									<Tag
										color={story.data().designLink ? `#0958d9` : `#f5f5f5`}
										icon={<BlockOutlined />}
										style={story.data().designLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
									>
										Design
									</Tag>
								</LinkTo>
								<LinkTo href={story.data().pageLink} openInNewTab>
									<Tag
										color={story.data().pageLink ? `#0958d9` : `#f5f5f5`}
										icon={<LinkOutlined />}
										style={story.data().pageLink ? {} : {color: `#d9d9d9`, border: `1px solid currentColor`}}
									>
										Page
									</Tag>
								</LinkTo>
							</div>
						</div>
					</div>
				</div>
			}
		>
			<div className="grid h-full grid-cols-2 gap-8">
				{/* Left column */}
				<div className="flex h-full min-h-0 flex-col gap-6">
					{user && (
						<div className="flex flex-col items-start gap-2">
							{story.data().ethicsApproved === null ? (
								<>
									<div className="leading-normal">
										<p className="text-lg font-semibold">Adjudication Response</p>
										<p className="text-sm text-textTertiary">
											Do you think this would provide value and reaffirm the commitment to our users?
										</p>
									</div>

									<Radio.Group
										value={story.data().ethicsVotes[user.id] ? `allow` : `reject`}
										onChange={(e) => {
											addVote(e.target.value === `allow`).catch(console.error)
										}}
									>
										<Radio value="allow">Allow</Radio>
										<Radio value="reject">Reject</Radio>
									</Radio.Group>
								</>
							) : (
								<>
									<p className="text-lg font-semibold">Adjudication Response</p>
									{story.data().ethicsApproved ? (
										<Tag icon={<LikeOutlined />} color="green">
											Approved
										</Tag>
									) : (
										<Tag icon={<DislikeOutlined />} color="red">
											Rejected
										</Tag>
									)}
								</>
							)}
						</div>
					)}
					<div className="flex max-h-[calc(100%-8rem)] flex-col gap-2">
						<p className="text-lg font-semibold">User Story</p>
						<Input.TextArea
							rows={4}
							value={description}
							onChange={(e) => {
								setDescription(e.target.value)
								updateDoc(story.ref, {description: e.target.value}).catch(console.error)
							}}
							className="max-h-[calc(100%-2.25rem)]"
						/>
					</div>
				</div>

				{/* Right column */}
				<div className="flex h-full flex-col gap-2">
					<div className="flex items-center justify-between">
						<p className="text-lg font-semibold">Comments</p>
						<Segmented
							size="small"
							value={commentType}
							onChange={(value) => setCommentType(value as `code` | `design`)}
							options={[
								{label: `Design`, icon: <BlockOutlined />, value: `design`},
								{label: `Code`, icon: <CodeOutlined />, value: `code`},
							]}
						/>
					</div>
					<div className="relative grow">
						<Comments
							storyMapItem={story}
							commentType={commentType}
							flagged={story.data().ethicsColumn !== null}
							onFlag={async () => {
								await updateDoc(story.ref, {ethicsColumn: `underReview`})
							}}
						/>
					</div>
				</div>
			</div>
		</Drawer>
	)
}

export default StoryDrawer
