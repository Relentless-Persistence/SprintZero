import {useState} from "react"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"

import StoryContainer from "./StoryContainer"
import StoryDrawer from "~/components/StoryDrawer"

export type StoryProps = {
	storyMapItems: StoryMapItem[]
	versions: QuerySnapshot<Version>
	storyId: string
}

const Story: FC<StoryProps> = ({storyMapItems, versions, storyId}) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [isBeingDragged, setIsBeingDragged] = useState(false)

	return (
		<>
			<StoryContainer
				storyMapItems={storyMapItems}
				storyId={storyId}
				onDrawerOpen={() => setIsDrawerOpen(true)}
				isBeingDragged={isBeingDragged}
				onDragStart={() => setIsBeingDragged(true)}
				onDragEnd={() => setIsBeingDragged(false)}
			/>

			<StoryDrawer
				storyMapItems={storyMapItems}
				versions={versions}
				storyId={storyId}
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Story
