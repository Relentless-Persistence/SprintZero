import {CopyOutlined, ReadOutlined} from "@ant-design/icons"
import {Button, Card, Tag} from "antd"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"

import {getEpics, getFeatures, getStories} from "~/utils/storyMap"

export type StoryCardProps = {
	storyMapItems: QuerySnapshot<StoryMapItem>
	storyId: string
	onDrawerOpen: () => void
}

const StoryCard: FC<StoryCardProps> = ({storyMapItems, onDrawerOpen, storyId}) => {
	const story = getStories(storyMapItems).find((story) => story.id === storyId)!
	const feature = getFeatures(storyMapItems).find(({id}) => id === story.data().parentId)!
	const epic = getEpics(storyMapItems).find(({id}) => id === feature.data().parentId)!

	return (
		<Card
			size="small"
			type="inner"
			title={story.data().name}
			extra={
				<Button size="small" onClick={() => onDrawerOpen()}>
					View
				</Button>
			}
		>
			<div className="flex gap-2">
				<Tag color="#f9f0ff" icon={<ReadOutlined />} className="!border-current !text-[#722ed1]">
					{epic.data().name}
				</Tag>
				<Tag color="#e6fffb" icon={<CopyOutlined />} className="!border-current !text-[#006d75]">
					{feature.data().name}
				</Tag>
			</div>
		</Card>
	)
}

export default StoryCard
