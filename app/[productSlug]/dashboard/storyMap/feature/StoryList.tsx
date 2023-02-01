import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import AddStoryButton from "../story/AddStoryButton"
import Story from "../story/Story"

export type StoryListProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	currentVersionId: Id | `__ALL_VERSIONS__`
	featureId: string
	inert?: boolean
}

const StoryList: FC<StoryListProps> = ({activeProduct, storyMapState, currentVersionId, featureId, inert = false}) => {
	const feature = storyMapState.features.find((feature) => feature.id === featureId)!
	const stories = feature.storyIds
		.map((id) => storyMapState.stories.find((story) => story.id === id))
		.filter((story) => currentVersionId === `__ALL_VERSIONS__` || story?.versionId === currentVersionId)

	if (stories.length === 0)
		return <AddStoryButton storyMapState={storyMapState} currentVersionId={currentVersionId} featureId={featureId} />
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

			{currentVersionId !== `__ALL_VERSIONS__` && (
				<div className="m-1.5">
					<AddStoryButton storyMapState={storyMapState} currentVersionId={currentVersionId} featureId={featureId} />
				</div>
			)}
		</div>
	)
}

export default StoryList
