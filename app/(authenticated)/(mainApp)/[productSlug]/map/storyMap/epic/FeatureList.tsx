import {CopyOutlined} from "@ant-design/icons"

import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {Product} from "~/types/db/Products"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import Feature from "../feature/Feature"
import {addFeature} from "~/utils/mutations"

export type FeatureListProps = {
	activeProduct: WithDocumentData<Product>
	storyMapState: WithDocumentData<StoryMapState>
	currentVersionId: Id | `__ALL_VERSIONS__`
	epicId: string
	inert?: boolean
}

const FeatureList: FC<FeatureListProps> = ({activeProduct, storyMapState, currentVersionId, epicId, inert = false}) => {
	const epic = storyMapState.epics.find((epic) => epic.id === epicId)!
	const features = epic.featureIds.map((id) => storyMapState.features.find((feature) => feature.id === id))

	return (
		<>
			{features.map(
				(feature) =>
					feature && (
						<Feature
							key={feature.id}
							activeProduct={activeProduct}
							storyMapState={storyMapState}
							currentVersionId={currentVersionId}
							featureId={feature.id}
							inert={inert}
						/>
					),
			)}

			{features.length === 0 && (
				<button
					type="button"
					onClick={() => void addFeature({storyMapState: storyMapState!, epicId: epic.id, data: {}})}
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
