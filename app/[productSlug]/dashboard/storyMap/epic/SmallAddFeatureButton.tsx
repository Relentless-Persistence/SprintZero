import {PlusOutlined} from "@ant-design/icons"
import clsx from "clsx"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic as EpicType} from "~/types/db/Products"

import {useGetEpic} from "../atoms"
import {addFeature} from "~/utils/api/mutations"

export type SmallAddFeatureButtonProps = {
	productId: Id
	epic: EpicType
}

const SmallAddFeatureButton: FC<SmallAddFeatureButtonProps> = ({productId, epic}) => {
	const features = useGetEpic(epic.id).features

	return (
		<button
			type="button"
			onClick={() => void addFeature({productId, epicId: epic.id, data: {name: `Feature`}})}
			className={clsx(
				`grid h-4 w-4 place-items-center rounded-full bg-green text-[0.6rem] text-white`,
				features.length === 0 && `invisible`,
			)}
		>
			<PlusOutlined />
		</button>
	)
}

export default SmallAddFeatureButton
