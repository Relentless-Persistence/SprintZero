import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import {currentVersionAtom} from "../atoms"
import AddStoryButton from "../story/AddStoryButton"
import Story from "../story/Story"

export type StoryListProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	featureId: string
	inert?: boolean
}

const StoryList: FC<StoryListProps> = ({activeProduct, storyMapState, featureId, inert = false}) => {
	const currentVersion = useAtomValue(currentVersionAtom)
	const feature = storyMapState.features.find((feature) => feature.id === featureId)!
	const stories = feature.storyIds
		.map((id) => storyMapState.stories.find((story) => story.id === id))
		.filter((story) => currentVersion.id === `__ALL_VERSIONS__` || story?.versionId === currentVersion.id)

	if (stories.length === 0) return <AddStoryButton feature={feature} />
	return (
		<div className="flex flex-col items-start rounded-md border border-[#006378] bg-white p-1.5">
			{stories.map(
				(story) =>
					story && (
						<Story
							key={story.id}
							activeProduct={activeProduct}
							storyMapState={storyMapState}
							storyId={story.id}
							inert={inert}
						/>
					),
			)}

			{currentVersion.id !== `__ALL_VERSIONS__` && (
				<div className="m-1.5">
					<AddStoryButton feature={feature} />
				</div>
			)}
		</div>
	)
}

export default StoryList
