import {CopyOutlined, DislikeOutlined, LikeOutlined, ReadOutlined} from "@ant-design/icons"
import {Button, Card, Tag} from "antd"
import {useState} from "react"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import StoryDrawer from "~/app/(authenticated)/[productSlug]/(product)/tactics/ethics/StoryDrawer"
import {getEpics, getFeatures, getStories} from "~/utils/storyMap"

export type StoryProps = {
	storyMapItems: QuerySnapshot<StoryMapItem>
	storyId: string
}

const Story: FC<StoryProps> = ({storyMapItems, storyId}) => {
	const story = getStories(storyMapItems).find((story) => story.id === storyId)!
	const feature = getFeatures(storyMapItems).find((feature) => feature.id === story.data().parentId)!
	const epic = getEpics(storyMapItems).find((epic) => epic.id === feature.data().parentId)!
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	return (
		<>
			<Card
				type="inner"
				size="small"
				title={story.data().name}
				extra={<Button onClick={() => setIsDrawerOpen(true)}>View</Button>}
			>
				<div className="flex gap-1">
					<Tag color="purple" icon={<ReadOutlined />}>
						{epic.data().name}
					</Tag>
					<Tag color="cyan" icon={<CopyOutlined />}>
						{feature.data().name}
					</Tag>
					{story.data().ethicsColumn === `adjudicated` &&
						(story.data().ethicsApproved ? (
							<Tag icon={<LikeOutlined />} color="green">
								Approved
							</Tag>
						) : (
							<Tag icon={<DislikeOutlined />} color="red">
								Rejected
							</Tag>
						))}
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
