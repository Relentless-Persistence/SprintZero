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
import { Avatar, Drawer, Input, Popover, Radio, Segmented, Tag } from "antd"
import clsx from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { collection, doc, updateDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import { useInterval } from "react-use"

import type { QueryDocumentSnapshot, WithFieldValue } from "firebase/firestore"
import type { FC } from "react"
import type { Member } from "~/types/db/Products/Members"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import Comments from "~/components/Comments"
import LinkTo from "~/components/LinkTo"
import { MemberConverter } from "~/types/db/Products/Members"
import { sprintColumns } from "~/types/db/Products/StoryMapItems"
import dollarFormat from "~/utils/dollarFormat"
import { getStories } from "~/utils/storyMap"

dayjs.extend(relativeTime)

export type StoryDrawerProps = {
	storyMapItems: StoryMapItem[]
	storyId: string
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({ storyMapItems, storyId, isOpen, onClose }) => {
	const { product, member } = useAppContext()
	const story = getStories(storyMapItems).find((story) => story.id === storyId)!
	const [description, setDescription] = useState(story.description)
	const [commentType, setCommentType] = useState<`engineering` | `design`>(`engineering`)

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	useErrorHandler(membersError)

	useEffect(() => {
		setDescription(story.description)
	}, [story])

	const addVote = async (vote: boolean) => {
		if (!members) return

		let votesFor = Object.values(story.ethicsVotes).filter((vote) => vote === true).length
		let votesAgainst = Object.values(story.ethicsVotes).filter((vote) => vote === false).length
		if (vote) votesFor++
		else votesAgainst++
		const votingComplete = votesFor + votesAgainst === members.docs.length
		const votingResult = votesFor > votesAgainst

		if (votingComplete) {
			const data: WithFieldValue<Partial<StoryMapItem>> = {
				[`ethicsVotes.${member.id}`]: vote,
				ethicsApproved: votingResult,
				ethicsColumn: `adjudicated`,
			}
			await updateDoc(doc(product.ref, `StoryMapItems`, story.id), data)
		} else {
			const data: WithFieldValue<Partial<StoryMapItem>> = {
				[`ethicsVotes.${member.id}`]: vote,
			}
			await updateDoc(doc(product.ref, `StoryMapItems`, story.id), data)
		}
	}

	const totalEffort = story.designEffort + story.engineeringEffort

	const [lastModifiedText, setLastModifiedText] = useState<string | undefined>(undefined)
	useInterval(() => {
		setLastModifiedText(dayjs(story.updatedAt.toMillis()).fromNow())
	}, 1000)

	const peoplePopoverItems = story.peopleIds
		.map((userId) => members?.docs.find((user) => user.id === userId))
		.filter((user): user is QueryDocumentSnapshot<Member> => user?.exists() ?? false)
		.map((user) => (
			<div key={user.id} className="flex items-center gap-2 rounded bg-[#f0f0f0] p-2">
				<Avatar src={member.data().avatar} shape="square" size="small" />
				{member.data().name}
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
						<p>{story.name}</p>
						{lastModifiedText && members && (
							<p className="text-sm font-normal text-textTertiary">
								Last modified {lastModifiedText} by{` `}
								{members.docs.find((member) => member.id === story.updatedAtUserId)?.data().name ?? `unknown user`}
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
								{sprintColumns[story.sprintColumn]}
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
									{story.peopleIds.length}
								</Tag>
							</Popover>

							<div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-1">
								<Tag
									color={story.branchName ? `#0958d9` : `#f5f5f5`}
									icon={<CodeOutlined />}
									style={story.branchName ? {} : { color: `#d9d9d9`, border: `1px solid currentColor` }}
								>
									{story.branchName ?? `No branch`}
								</Tag>
								<LinkTo href={story.designLink} openInNewTab>
									<Tag
										color={story.designLink ? `#0958d9` : `#f5f5f5`}
										icon={<BlockOutlined />}
										style={story.designLink ? {} : { color: `#d9d9d9`, border: `1px solid currentColor` }}
									>
										Design
									</Tag>
								</LinkTo>
								<LinkTo href={story.pageLink} openInNewTab>
									<Tag
										color={story.pageLink ? `#0958d9` : `#f5f5f5`}
										icon={<LinkOutlined />}
										style={story.pageLink ? {} : { color: `#d9d9d9`, border: `1px solid currentColor` }}
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
					<div className="flex flex-col items-start gap-2">
						{story.ethicsApproved === null ? (
							<>
								<div className="leading-normal">
									<p className="text-lg font-semibold">Adjudication Response</p>
									<p className="text-sm text-textTertiary">
										Do you think this would provide value and reaffirm the commitment to our users?
									</p>
								</div>

								<Radio.Group
									value={
										story.ethicsVotes[member.id] === true
											? `allow`
											: story.ethicsVotes[member.id] === false
												? `reject`
												: undefined
									}
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
								{story.ethicsApproved ? (
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
					<div className="flex max-h-[calc(100%-8rem)] flex-col gap-2">
						<p className="text-lg font-semibold">User Story</p>
						<Input.TextArea
							rows={4}
							value={description}
							onChange={(e) => {
								setDescription(e.target.value)
								updateDoc(doc(product.ref, `StoryMapItems`, story.id), { description: e.target.value }).catch(
									console.error,
								)
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
							onChange={(value) => setCommentType(value as `engineering` | `design`)}
							options={[
								{ label: `Design`, icon: <BlockOutlined />, value: `design` },
								{ label: `Code`, icon: <CodeOutlined />, value: `engineering` },
							]}
						/>
					</div>
					<div className="relative grow">
						<Comments
							storyMapItem={story}
							commentType={commentType}
							flagged={story.ethicsColumn !== null}
							onFlag={async () => {
								await updateDoc(doc(product.ref, `StoryMapItems`, story.id), { ethicsColumn: `underReview` })
							}}
						/>
					</div>
				</div>
			</div>
		</Drawer>
	)
}

export default StoryDrawer
