import {CopyOutlined, DislikeOutlined, LikeOutlined, ReadOutlined} from "@ant-design/icons"
import {Button, Card, Tag} from "antd"
import {useState} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import StoryDrawer from "~/app/(authenticated)/[productSlug]/(product)/tactics/ethics/StoryDrawer"
import {getStories} from "~/utils/storyMap"

export type StoryProps = {
	activeProduct: QueryDocumentSnapshot<Product>
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	storyId: Id
}

const Story: FC<StoryProps> = ({activeProduct, storyMapState, storyId}) => {
	const story = getStories(storyMapState.data().items).find((story) => story.id === storyId)!
	const feature = Object.entries(storyMapState.data().items).find(([id]) => id === story.parentId)!
	const epic = Object.entries(storyMapState.data().items).find(([id]) => id === feature[1]!.parentId)!
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	return (
		<>
			<Card
				type="inner"
				size="small"
				title={story.name}
				extra={<Button onClick={() => setIsDrawerOpen(true)}>View</Button>}
			>
				<div className="flex gap-1">
					<Tag color="purple" icon={<ReadOutlined />}>
						{epic[1]!.name}
					</Tag>
					<Tag color="cyan" icon={<CopyOutlined />}>
						{feature[1]!.name}
					</Tag>
					{story.ethicsApproved ? (
						<Tag icon={<LikeOutlined />} color="green">
							Approved
						</Tag>
					) : (
						<Tag icon={<DislikeOutlined />} color="red">
							Rejected
						</Tag>
					)}
				</div>
			</Card>

			<StoryDrawer
				activeProduct={activeProduct}
				storyMapState={storyMapState}
				storyId={storyId}
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Story
