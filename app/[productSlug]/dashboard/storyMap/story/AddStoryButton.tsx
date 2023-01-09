import {FileOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Feature as FeatureType} from "~/types/db/Features"

import {currentVersionAtom} from "../atoms"
import {addStory} from "~/utils/api/mutations"

export type AddStoryButtonProps = {
	feature: FeatureType
}

const AddStoryButton: FC<AddStoryButtonProps> = ({feature}) => {
	const currentVersion = useAtomValue(currentVersionAtom)

	if (currentVersion === `__ALL_VERSIONS__`) return null
	return (
		<button
			type="button"
			onClick={() =>
				void addStory({
					featureId: feature.id,
					name: `story`,
					description: `description`,
					version: currentVersion,
				})
			}
			className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
		>
			<FileOutlined />
			<span>Add story</span>
		</button>
	)
}

export default AddStoryButton
