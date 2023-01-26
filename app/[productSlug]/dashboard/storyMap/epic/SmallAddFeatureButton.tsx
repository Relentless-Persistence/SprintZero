import {PlusOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Products"

import {addFeature} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

export type SmallAddFeatureButtonProps = {
	epic: EpicType
}

const SmallAddFeatureButton: FC<SmallAddFeatureButtonProps> = ({epic}) => {
	const activeProduct = useAtomValue(activeProductAtom)

	return (
		<button
			type="button"
			onClick={() => void addFeature({storyMapState: activeProduct!.storyMapState, epicId: epic.id, data: {}})}
			className="grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white"
		>
			<PlusOutlined />
		</button>
	)
}

export default SmallAddFeatureButton
