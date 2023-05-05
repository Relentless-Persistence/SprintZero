import { CopyOutlined, DislikeOutlined, LikeOutlined, ReadOutlined } from "@ant-design/icons"
import { Button, Card, Progress, Tag } from "antd"
import { useState } from "react"

import type { FC } from "react"
import type { Member } from "~/types/db/Products/Members"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems"

import StoryDrawer from "~/app/(authenticated)/[productSlug]/(product)/tactics/ethics/StoryDrawer"
import { getEpics, getFeatures, getStories } from "~/utils/storyMap"

export type StoryProps = {
	storyMapItems: StoryMapItem[]
	storyId: string
	members: Member[]
	tab: string
}

const Story: FC<StoryProps> = ({ storyMapItems, storyId, members, tab }) => {
	const story = getStories(storyMapItems).find((story) => story.id === storyId)!
	const feature = getFeatures(storyMapItems).find((feature) => feature.id === story.parentId)!
	const epic = getEpics(storyMapItems).find((epic) => epic.id === feature.parentId)!
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const votePercentage = (Object.keys(story.ethicsVotes).length / members.length) * 100;

	return (
		<>
			<Card
				type="inner"
				size="small"
				title={story.name}
				extra={<Button onClick={() => setIsDrawerOpen(true)}>Vote</Button>}
			>
				<div className="w-full">
					<div className="flex gap-1">
						<Tag color="purple" icon={<ReadOutlined />}>
							{epic.name}
						</Tag>
						<Tag color="cyan" icon={<CopyOutlined />}>
							{feature.name}
						</Tag>
						{story.ethicsColumn === `adjudicated` &&
							(story.ethicsApproved ? (
								<Tag icon={<LikeOutlined />} color="green">
									Approved
								</Tag>
							) : (
								<Tag icon={<DislikeOutlined />} color="red">
									Rejected
								</Tag>
							))}
					</div>
					<div className="w-full">
						{tab === `flagged` ? <Progress style={{ width: `100%` }} percent={votePercentage} steps={members.length} strokeColor={[`#54A31C`]} /> : null}
					</div>
				</div>
			</Card>

			<StoryDrawer
				storyMapItems={storyMapItems}
				storyId={storyId}
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Story