import {useState} from "react"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import StoryContainer from "./StoryContainer"
import {useGenMeta} from "~/app/(authenticated)/[productSlug]/(product)/map/meta"
import StoryDrawer from "~/app/(authenticated)/[productSlug]/(product)/map/StoryDrawer"

export type StoryProps = {
	storyMapItems: QuerySnapshot<StoryMapItem>
	allVersions: QuerySnapshot<Version>
	storyId: Id
}

const Story: FC<StoryProps> = ({storyMapItems, allVersions, storyId}) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [isBeingDragged, setIsBeingDragged] = useState(false)

	return (
		<>
			<StoryContainer
				storyMapState={storyMapState}
				storyId={storyId}
				onDrawerOpen={() => setIsDrawerOpen(true)}
				isBeingDragged={isBeingDragged}
				onDragStart={() => setIsBeingDragged(true)}
				onDragEnd={() => setIsBeingDragged(false)}
			/>

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</>
	)
}

export default Story
