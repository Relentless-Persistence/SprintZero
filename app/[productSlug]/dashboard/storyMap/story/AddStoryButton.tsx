import {FileOutlined} from "@ant-design/icons"

import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import {addStory} from "~/utils/mutations"

export type AddStoryButtonProps = {
	storyMapState: WithDocumentData<StoryMapState>
	currentVersionId: Id | `__ALL_VERSIONS__`
	featureId: string
}

const AddStoryButton: FC<AddStoryButtonProps> = ({storyMapState, currentVersionId, featureId}) => {
	if (currentVersionId === `__ALL_VERSIONS__`) return null
	return (
		<button
			type="button"
			onClick={() => {
				if (currentVersionId !== `__ALL_VERSIONS__`)
					addStory({storyMapState, featureId, data: {versionId: currentVersionId}})
			}}
			className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
		>
			<FileOutlined />
			<span>Add story</span>
		</button>
	)
}

export default AddStoryButton
