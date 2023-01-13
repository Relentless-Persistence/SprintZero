import {CopyOutlined} from "@ant-design/icons"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Epic as EpicType} from "~/types/db/Products"

import {useGetEpic} from "../atoms"
import Feature from "../feature/Feature"
import {addFeature} from "~/utils/api/mutations"

export type FeatureListProps = {
	productId: Id
	epic: EpicType
	inert?: boolean
}

const FeatureList: FC<FeatureListProps> = ({productId, epic, inert = false}) => {
	const features = useGetEpic(epic.id).features

	return (
		<>
			{features.map((feature) => (
				<Feature key={feature.id} productId={productId} epicId={epic.id} feature={feature} inert={inert} />
			))}

			{features.length === 0 && (
				<button
					type="button"
					onClick={() => void addFeature({productId, epicId: epic.id, data: {name: `Feature`}})}
					className="mx-4 flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
				>
					<CopyOutlined />
					<span>Add feature</span>
				</button>
			)}
		</>
	)
}

export default FeatureList
