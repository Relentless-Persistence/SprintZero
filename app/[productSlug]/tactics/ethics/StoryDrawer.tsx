import {CloseOutlined, DislikeOutlined, LikeOutlined} from "@ant-design/icons"
import {Input, Drawer, Tag, Typography, Radio} from "antd5"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Story} from "~/types/db/Products"

import Comments from "~/components/Comments"
import {updateStory} from "~/utils/api/mutations"
import {activeProductAtom, userIdAtom} from "~/utils/atoms"

export type StoryDrawerProps = {
	story: Story
	isOpen: boolean
	onClose: () => void
}

const StoryDrawer: FC<StoryDrawerProps> = ({story, isOpen, onClose}) => {
	const activeProduct = useAtomValue(activeProductAtom)
	const userId = useAtomValue(userIdAtom)

	const addVote = (vote: boolean) => {
		const ethicsVotes = story.ethicsVotes.filter((vote) => vote.userId !== userId)
		ethicsVotes.push({userId: userId!, vote})
		const votingComplete = ethicsVotes.length === activeProduct?.members.length

		let ethicsColumn: `identified` | `under-review` | `adjudicated` = `identified`
		if (ethicsVotes.length === 1) ethicsColumn = `under-review`
		if (votingComplete) ethicsColumn = `adjudicated`

		updateStory({
			storyMapState: activeProduct!.storyMapState,
			storyId: story.id,
			data: {
				ethicsApproved: votingComplete
					? ethicsVotes.filter((vote) => vote.vote === true).length >
					  ethicsVotes.filter((vote) => vote.vote === false).length
					: null,
				ethicsColumn,
				ethicsVotes,
			},
		})
	}

	return (
		<Drawer
			title={story.name}
			placement="bottom"
			closable={false}
			extra={
				<div className="flex items-center gap-2">
					<div>
						<Tag color="#91d5ff">
							{story.points} point{story.points === 1 ? `` : `s`} total
						</Tag>
						{activeProduct?.effortCost && <Tag color="#a4df74">${activeProduct.effortCost * story.points}</Tag>}
					</div>

					<div className="grow" />

					<button type="button" onClick={() => void onClose()}>
						<CloseOutlined />
					</button>
				</div>
			}
			className="[&_.ant-drawer-header-title]:flex-[0_0_auto] [&_.ant-drawer-extra]:flex-[1_1_0%]"
			headerStyle={{gap: `1rem`}}
			open={isOpen}
			onClose={() => void onClose()}
		>
			<div className="grid h-full grid-cols-2 gap-4">
				{/* Left column */}
				<div className="space-y-4">
					<div className="space-y-2">
						{story.ethicsApproved === null ? (
							<>
								<div>
									<p className="text-xl font-semibold">Adjudication Response</p>
									<p className="text-xs">
										Do you think this would provide value and reaffirm the commitment to our users?
									</p>
								</div>

								<Radio.Group onChange={(e) => void addVote(e.target.value === `allow`)}>
									<Radio value="allow">Allow</Radio>
									<Radio value="reject">Reject</Radio>
								</Radio.Group>
							</>
						) : (
							<>
								<p className="text-xl font-semibold">Adjudication Response</p>
								{story.ethicsApproved ? (
									<div className="inline-flex items-center gap-2 bg-[#90D855] py-2 px-4">
										<LikeOutlined />
										Allowed
									</div>
								) : (
									<div className="inline-flex items-center gap-2 bg-[#FFA39E] py-2 px-4">
										<DislikeOutlined />
										Rejected
									</div>
								)}
							</>
						)}
					</div>

					<div>
						<Typography.Title level={4}>Story</Typography.Title>
						<Input.TextArea rows={4} value={story.description} disabled />
					</div>
				</div>

				{/* Right column */}
				<div className="flex h-full flex-col">
					<Typography.Title level={4}>Comments</Typography.Title>
					<div className="relative grow">
						<Comments
							commentList={story.commentIds}
							onCommentListChange={(newCommentList) =>
								void updateStory({
									storyMapState: activeProduct!.storyMapState,
									storyId: story.id,
									data: {
										commentIds: newCommentList,
									},
								})
							}
						/>
					</div>
				</div>
			</div>
		</Drawer>
	)
}

export default StoryDrawer
