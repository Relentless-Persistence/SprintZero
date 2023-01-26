import {FileOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Feature as FeatureType} from "~/types/db/Products"

import {currentVersionAtom} from "../atoms"
import {addStory} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

export type AddStoryButtonProps = {
	feature: FeatureType
}

const AddStoryButton: FC<AddStoryButtonProps> = ({feature}) => {
	const activeProduct = useAtomValue(activeProductAtom)
	const currentVersion = useAtomValue(currentVersionAtom)

	if (currentVersion.id === `__ALL_VERSIONS__`) return null
	return (
		<button
			type="button"
			onClick={() => {
				if (currentVersion.id !== `__ALL_VERSIONS__`)
					addStory({
						storyMapState: activeProduct!.storyMapState,
						featureId: feature.id,
						data: {versionId: currentVersion.id},
					})
			}}
			className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
		>
			<FileOutlined />
			<span>Add story</span>
		</button>
	)
}

export default AddStoryButton
