import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Feature as FeatureType} from "~/types/db/Products"

import {currentVersionAtom, storyMapStateAtom} from "../atoms"
import AddStoryButton from "../story/AddStoryButton"
import Story from "../story/Story"

export type StoryListProps = {
	feature: FeatureType
	inert?: boolean
}

const StoryList: FC<StoryListProps> = ({feature, inert = false}) => {
	const currentVersion = useAtomValue(currentVersionAtom)
	const storyMapState = useAtomValue(storyMapStateAtom)
	const stories = feature.storyIds
		.map((id) => storyMapState.stories.find((story) => story.id === id)!)
		.filter((story) => currentVersion.id === `__ALL_VERSIONS__` || story.versionId === currentVersion.id)

	if (stories.length === 0) return <AddStoryButton feature={feature} />
	return (
		<div className="flex flex-col items-start rounded-md border border-[#006378] bg-white p-1.5">
			{stories.map((story) => (
				<Story key={story.id} story={story} inert={inert} />
			))}

			{currentVersion.id !== `__ALL_VERSIONS__` && (
				<div className="m-1.5">
					<AddStoryButton feature={feature} />
				</div>
			)}
		</div>
	)
}

export default StoryList
