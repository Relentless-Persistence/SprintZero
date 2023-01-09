import {CopyOutlined} from "@ant-design/icons"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"
import type {Feature as FeatureType} from "~/types/db/Features"

import {featuresAtom, storyMapStateAtom} from "../atoms"
import Feature from "../feature/Feature"
import {addFeature} from "~/utils/api/mutations"

export type FeatureListProps = {
	epic: EpicType
}

const FeatureList: FC<FeatureListProps> = ({epic}) => {
	const features = useAtomValue(featuresAtom)
	const storyMapState = useAtomValue(storyMapStateAtom)
	const featuresOrder = storyMapState.find((e) => e.epic === epic.id)!.featuresOrder

	return (
		<>
			{featuresOrder
				.map(({feature}) => features.find((f) => f.id === feature))
				.filter((feature): feature is FeatureType => feature !== undefined)
				.map((feature) => (
					<Feature key={feature.id} feature={feature} />
				))}

			{features.length === 0 && (
				<button
					type="button"
					onClick={() => void addFeature({epicId: epic.id, name: `Feature`})}
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
