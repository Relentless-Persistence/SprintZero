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
	const stories = useGetFeature(epicId, feature.id).stories
	const currentVersion = useAtomValue(currentVersionAtom)

	if (stories.length === 0 || currentVersion.id === `__ALL_VERSIONS__`)
		return <AddStoryButton productId={productId} epicId={epicId} feature={feature} />
	return (
		<div className="flex flex-col items-start rounded-md border border-[#006378] bg-white">
			{stories.map((story) => (
				<Story key={story.id} story={story} />
			))}

			{currentVersion.id !== `__ALL_VERSIONS__` && (
				<div className="m-3 mt-0">
					<AddStoryButton productId={productId} epicId={epicId} feature={feature} />
				</div>
			)}
		</div>
	)
}

export default StoryList
