import {PlusOutlined} from "@ant-design/icons"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic as EpicType} from "~/types/db/Products"

import {addFeature} from "~/utils/api/mutations"

export type SmallAddFeatureButtonProps = {
	productId: Id
	epic: EpicType
}

const SmallAddFeatureButton: FC<SmallAddFeatureButtonProps> = ({productId, epic}) => {
	return (
		<button
			type="button"
			onClick={() => void addFeature({productId, epicId: epic.id, data: {name: `Feature`}})}
			className="grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white"
		>
			<PlusOutlined />
		</button>
	)
}

export default SmallAddFeatureButton
