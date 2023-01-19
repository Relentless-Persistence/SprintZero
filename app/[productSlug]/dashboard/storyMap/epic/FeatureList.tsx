import {CopyOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Products"

import {storyMapStateAtom} from "../atoms"
import Feature from "../feature/Feature"
import {addFeature} from "~/utils/api/mutations"

export type FeatureListProps = {
	epic: EpicType
	inert?: boolean
}

const FeatureList: FC<FeatureListProps> = ({epic, inert = false}) => {
	const storyMapState = useAtomValue(storyMapStateAtom)
	const features = epic.featureIds.map((id) => storyMapState.features.find((feature) => feature.id === id)!)

	return (
		<>
			{features.map((feature) => (
				<Feature key={feature.id} feature={feature} inert={inert} />
			))}

			{features.length === 0 && (
				<button
					type="button"
					onClick={() => void addFeature({storyMapState, epicId: epic.id, data: {}})}
					className="flex items-center gap-2 rounded-md border border-dashed border-[currentColor] bg-white px-2 py-1 text-[#006378] transition-colors hover:bg-[#f2fbfe]"
				>
					<CopyOutlined />
					<span>Add feature</span>
				</button>
			)}
		</>
	)
}

export default FeatureList
