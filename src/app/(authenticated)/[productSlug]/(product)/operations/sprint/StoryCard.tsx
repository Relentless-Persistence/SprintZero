import {CopyOutlined, ReadOutlined} from "@ant-design/icons"
import {Button, Card, Tag} from "antd"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import {getStories} from "~/utils/storyMap"

export type StoryCardProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	storyId: Id
	onDrawerOpen: () => void
}

const StoryCard: FC<StoryCardProps> = ({storyMapState, onDrawerOpen, storyId}) => {
	const story = getStories(storyMapState.data().items).find((story) => story.id === storyId)!
	const feature = Object.entries(storyMapState.data().items).find(([id]) => id === story.parentId)!
	const epic = Object.entries(storyMapState.data().items).find(([id]) => id === feature[1]!.parentId)!

	return (
		<Card
			size="small"
			type="inner"
			title={story.name}
			extra={
				<Button size="small" onClick={() => onDrawerOpen()}>
					View
				</Button>
			}
		>
			<div className="flex gap-2">
				<Tag color="#f9f0ff" icon={<ReadOutlined />} className="!border-current !text-[#722ed1]">
					{epic[1]!.name}
				</Tag>
				<Tag color="#e6fffb" icon={<CopyOutlined />} className="!border-current !text-[#006d75]">
					{feature[1]!.name}
				</Tag>
			</div>
		</Card>
	)
}

export default StoryCard
