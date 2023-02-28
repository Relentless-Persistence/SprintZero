import {CopyOutlined, ReadOutlined} from "@ant-design/icons"
import {Button, Card, Tag} from "antd"
import {useState} from "react"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {useGenMeta} from "~/app/(authenticated)/[productSlug]/(product)/map/meta"
import StoryDrawer from "~/app/(authenticated)/[productSlug]/(product)/map/StoryDrawer"
import {getStories} from "~/utils/storyMap"

export type StoryProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	allVersions: QuerySnapshot<Version>
	storyId: Id
}

const Story: FC<StoryProps> = ({storyMapState, allVersions, storyId}) => {
	const story = getStories(storyMapState.data().items).find((story) => story.id === storyId)!
	const feature = Object.entries(storyMapState.data().items).find(([id]) => id === story.parentId)!
	const epic = Object.entries(storyMapState.data().items).find(([id]) => id === feature[1]!.parentId)!
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const meta = useGenMeta({
		storyMapState,
		allVersions,
		currentVersionId: `__ALL_VERSIONS__`,
		editMode: false,
		itemsToBeDeleted: [],
		setItemsToBeDeleted: () => {},
	})

	return (
		<>
			<Card
				size="small"
				type="inner"
				title={story.name}
				extra={
					<Button size="small" onClick={() => setIsDrawerOpen(true)}>
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

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</>
	)
}

export default Story
