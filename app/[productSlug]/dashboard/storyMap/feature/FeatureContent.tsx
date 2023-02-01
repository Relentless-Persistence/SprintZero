import {CopyOutlined} from "@ant-design/icons"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {WithDocumentData} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import FeatureDrawer from "./FeatureDrawer"

export type FeatureContentProps = {
	storyMapState: WithDocumentData<StoryMapState>
	featureId: string
}

const FeatureContent: ForwardRefRenderFunction<HTMLDivElement, FeatureContentProps> = (
	{storyMapState, featureId},
	ref,
) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const feature = storyMapState.features.find((feature) => feature.id === featureId)!

	return (
		<>
			<div
				className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#006378] bg-white px-2 py-1 text-[#006378] transition-transform hover:scale-105"
				ref={ref}
			>
				<button
					type="button"
					onClick={() => void setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => void e.stopPropagation()}
				>
					<CopyOutlined />
				</button>
				<p>{feature.name}</p>
			</div>

			<FeatureDrawer
				storyMapState={storyMapState}
				featureId={featureId}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(FeatureContent)
