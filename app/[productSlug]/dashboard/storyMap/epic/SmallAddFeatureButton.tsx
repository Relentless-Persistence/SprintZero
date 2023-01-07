import {PlusOutlined} from "@ant-design/icons"
import {useMutation} from "@tanstack/react-query"
import clsx from "clsx"
import {useAtomValue} from "jotai"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"

import {featuresAtom} from "../atoms"
import {addFeature} from "~/utils/api/mutations"

export type SmallAddFeatureButtonProps = {
	epic: EpicType
}

const SmallAddFeatureButton: FC<SmallAddFeatureButtonProps> = ({epic}) => {
	const features = useAtomValue(featuresAtom).filter((feature) => feature.epic === epic.id)

	const addFeatureMutation = useMutation({
		mutationFn: addFeature(epic.id),
	})

	return (
		<button
			type="button"
			onClick={() => void addFeatureMutation.mutate(`Feature`)}
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
