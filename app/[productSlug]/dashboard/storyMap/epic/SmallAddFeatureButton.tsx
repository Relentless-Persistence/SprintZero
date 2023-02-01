import {PlusOutlined} from "@ant-design/icons"

import type {FC} from "react"
import type {WithDocumentData} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import {addFeature} from "~/utils/mutations"

export type SmallAddFeatureButtonProps = {
	storyMapState: WithDocumentData<StoryMapState>
	epicId: string
}

const SmallAddFeatureButton: FC<SmallAddFeatureButtonProps> = ({storyMapState, epicId}) => {
	return (
		<button
			type="button"
			onClick={() => void addFeature({storyMapState, epicId, data: {}})}
			className="grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white"
		>
			<PlusOutlined />
		</button>
	)
}

export default SmallAddFeatureButton
