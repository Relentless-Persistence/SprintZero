import {useState} from "react"

import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {useGenMeta} from "~/app/(authenticated)/(mainApp)/[productSlug]/map/meta"
import StoryDrawer from "~/app/(authenticated)/(mainApp)/[productSlug]/map/StoryDrawer"
import {getFeatures, getStories} from "~/utils/storyMap"

export type StoryProps = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	allVersions: QuerySnapshot<Version>
	storyId: Id
}

const Story: FC<StoryProps> = ({storyMapState, allVersions, storyId}) => {
	const story = getStories(storyMapState.data()).find((story) => story.id === storyId)!
	const featureName = getFeatures(storyMapState.data()).find((feature) => feature.id === story.parentId)!.name
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
			<button
				type="button"
				onClick={() => setIsDrawerOpen(true)}
				className="flex w-full flex-col gap-1 border px-4 py-2 text-left"
			>
				<p className="font-medium">{story.name}</p>
				<p className="inline-block border px-1 py-0.5 text-xs">{featureName}</p>
			</button>

			<StoryDrawer meta={meta} storyId={storyId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
		</>
	)
}

export default Story
