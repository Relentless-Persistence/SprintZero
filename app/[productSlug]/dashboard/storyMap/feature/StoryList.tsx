import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Feature as FeatureType} from "~/types/db/Products"

import {currentVersionAtom, useGetFeature} from "../atoms"
import AddStoryButton from "../story/AddStoryButton"
import Story from "../story/Story"

export type StoryListProps = {
	productId: Id
	epicId: Id
	feature: FeatureType
}

const StoryList: FC<StoryListProps> = ({productId, epicId, feature}) => {
	const currentVersion = useAtomValue(currentVersionAtom)
	const stories = useGetFeature(epicId, feature.id).stories.filter(
		(story) => currentVersion.id === `__ALL_VERSIONS__` || story.versionId === currentVersion.id,
	)

	if (stories.length === 0) return <AddStoryButton productId={productId} epicId={epicId} feature={feature} />
	return (
		<div className="flex flex-col items-start rounded-md border border-[#006378] bg-white p-1.5">
			{stories.map((story) => (
				<Story key={story.id} productId={productId} epicId={epicId} featureId={feature.id} story={story} />
			))}

			{currentVersion.id !== `__ALL_VERSIONS__` && (
				<div className="m-1.5">
					<AddStoryButton productId={productId} epicId={epicId} feature={feature} />
				</div>
			)}
		</div>
	)
}

export default StoryList
