import {CopyOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import {featuresAtom} from "../atoms"
import Feature from "../feature/Feature"
import {addFeature} from "~/utils/api/mutations"

export type FeatureListProps = {
	epic: EpicType
}

const FeatureList: FC<FeatureListProps> = ({epic}) => {
	const features = useAtomValue(featuresAtom).filter((feature) => feature.epic === epic.id)

	const addFeatureMutation = useMutation({
		mutationFn: addFeature(epic.id),
	})

	return (
		<>
			{features.map((feature) => (
				<Feature key={feature.id} epicId={epic.id} feature={feature} />
			))}
			{features.length === 0 && (
				<Button
					type="dashed"
					onClick={() => void addFeatureMutation.mutate(`Feature`)}
					className="flex items-center rounded-md bg-white transition-colors hover:bg-[#f2fbfe]"
					style={{borderColor: `#006378`, color: `#006378`, padding: `0.25rem 0.5rem`}}
				>
					<CopyOutlined />
					<span>Add feature</span>
				</Button>
			)}
		</>
	)
}

export default FeatureList
