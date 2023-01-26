"use client"

import {CopyOutlined} from "@ant-design/icons"
import produce from "immer"
import {useAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Feature as FeatureType} from "~/types/db/Products"

import FeatureDrawer from "./FeatureDrawer"
import AutoSizingInput from "../AutoSizingInput"
import {updateFeature} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

export type FeatureContentProps = {
	feature: FeatureType
}

const FeatureContent: ForwardRefRenderFunction<HTMLDivElement, FeatureContentProps> = ({feature}, ref) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [activeProduct, setActiveProduct] = useAtom(activeProductAtom)

	const updateLocalFeatureName = (newName: string) => {
		setActiveProduct((activeProduct) =>
			produce(activeProduct, (draft) => {
				draft!.storyMapState.features.find(({id}) => id === feature.id)!.name = newName
			}),
		)
	}

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
				<AutoSizingInput
					value={feature.name}
					onChange={(value) => {
						updateLocalFeatureName(value)
						updateFeature({storyMapState: activeProduct!.storyMapState, featureId: feature.id, data: {name: value}})
					}}
					inputStateId={feature.nameInputStateId}
					inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
				/>
			</div>

			<FeatureDrawer feature={feature} isOpen={isDrawerOpen} onClose={() => void setIsDrawerOpen(false)} />
		</>
	)
}

export default forwardRef(FeatureContent)
