import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Feature as FeatureType} from "~/types/db/Features"
import type {Story as StoryType} from "~/types/db/Stories"

import {currentVersionAtom, storiesAtom, storyMapStateAtom} from "../atoms"
import AddStoryButton from "../story/AddStoryButton"
import Story from "../story/Story"

export type StoryListProps = {
	feature: FeatureType
}

const StoryList: FC<StoryListProps> = ({feature}) => {
	const stories = useAtomValue(storiesAtom)
	const storyMapState = useAtomValue(storyMapStateAtom)
	const storiesOrder = storyMapState
		.find((e) => e.epic === feature.epic)!
		.featuresOrder.find((f) => f.feature === feature.id)!.storiesOrder
	const currentVersion = useAtomValue(currentVersionAtom)

	if (storiesOrder.length === 0 || currentVersion === `__ALL_VERSIONS__`) return <AddStoryButton feature={feature} />
	return (
		<div className="flex flex-col items-start rounded-md border border-[#006378] bg-white">
			{storiesOrder
				.map(({story}) => stories.find((f) => f.id === story))
				.filter((story): story is StoryType => story !== undefined)
				.map((story) => (
					<Story key={story.id} story={story} />
				))}

			{currentVersion !== `__ALL_VERSIONS__` && (
				<div className="m-3 mt-0">
					<AddStoryButton feature={feature} />
				</div>
			)}
		</div>
	)
}

export default StoryList
