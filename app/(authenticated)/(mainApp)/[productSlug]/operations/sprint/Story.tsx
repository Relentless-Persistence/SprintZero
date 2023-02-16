import {useState} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import StoryDrawer from "./StoryDrawer"
import {getFeatures, getStories} from "~/utils/storyMap"

export type StoryProps = {
	activeProduct: QueryDocumentSnapshot<Product>
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	storyId: Id
}

const Story: FC<StoryProps> = ({activeProduct, storyMapState, storyId}) => {
	const story = getStories(storyMapState.data()).find((story) => story.id === storyId)!
	const featureName = getFeatures(storyMapState.data()).find((feature) => feature.id === story.parentId)!.name
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	return (
		<>
			<button
				type="button"
				onClick={() => setIsDrawerOpen(true)}
				className="flex w-full flex-col gap-1 border border-laurel bg-[#fafafa] px-4 py-2 text-left"
			>
				<p className="font-medium">{story.name}</p>
				<p className="inline-block border border-[#aee383] bg-[#e1f4d1] px-1 py-0.5 text-xs text-[#315613]">
					{featureName}
				</p>
			</button>

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
