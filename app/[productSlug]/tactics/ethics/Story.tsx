import {DislikeFilled, LikeFilled} from "@ant-design/icons"
import {useState} from "react"

import type {SetStateAction} from "jotai"
import type {FC} from "react"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import StoryDrawer from "~/components/StoryDrawer"
import {Story} from "~/types/db/StoryMapStates"

export type StoryProps = {
	storyMapState: StoryMapState
	setStoryMapState: (val: SetStateAction<StoryMapState>) => void
	story: Story
}

const Story: FC<StoryProps> = ({storyMapState, setStoryMapState, story}) => {
	const featureName = storyMapState.features.find((feature) => feature.storyIds.includes(story.id))?.name
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
				storyMapState={storyMapState}
				setStoryMapState={setStoryMapState}
				story={story}
				hideAcceptanceCriteria
				disableEditing
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Story
