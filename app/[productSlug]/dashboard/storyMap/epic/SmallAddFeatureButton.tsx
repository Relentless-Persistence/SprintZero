import {PlusOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Products"

import {storyMapStateAtom} from "../atoms"
import {addFeature} from "~/utils/api/mutations"

export type SmallAddFeatureButtonProps = {
	epic: EpicType
}

const SmallAddFeatureButton: FC<SmallAddFeatureButtonProps> = ({epic}) => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	return (
		<button
			type="button"
			onClick={() => void addFeature({storyMapState, epicId: epic.id, data: {}})}
			className="grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white"
		>
			<PlusOutlined />
		</button>
	)
}

export default SmallAddFeatureButton
