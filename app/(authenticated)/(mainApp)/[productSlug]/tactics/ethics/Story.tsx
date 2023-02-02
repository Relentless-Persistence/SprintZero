import {DislikeFilled, LikeFilled} from "@ant-design/icons"
import {useState} from "react"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import StoryDrawer from "~/components/StoryDrawer"

export type StoryProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	storyId: string
}

const Story: FC<StoryProps> = ({activeProduct, storyMapState, storyId}) => {
	const story = storyMapState.stories.find((story) => story.id === storyId)!
	const featureName = storyMapState.features.find((feature) => feature.storyIds.includes(storyId))?.name
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	return (
		<>
			<button
				type="button"
				onClick={() => void setIsDrawerOpen(true)}
				className="flex w-full items-center justify-between gap-2 border border-laurel bg-[#fafafa] px-4 py-3 text-left"
			>
				<div className="space-y-1">
					<p className="font-medium">{story.name}</p>
					<p className="inline-block border border-green-t600 bg-green-t1100 px-1 py-0.5 text-xs text-green-s800">
						{featureName}
					</p>
				</div>
				{story.ethicsApproved === true && <LikeFilled className="text-xl text-[#54A31C]" />}
				{story.ethicsApproved === false && <DislikeFilled className="text-xl text-[#FA541C]" />}
			</button>

			<StoryDrawer
				activeProduct={activeProduct}
				storyMapState={storyMapState}
				storyId={storyId}
				hideAcceptanceCriteria
				disableEditing
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Story
