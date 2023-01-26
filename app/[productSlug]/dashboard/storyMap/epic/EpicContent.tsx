import {ReadOutlined} from "@ant-design/icons"
import produce from "immer"
import {useAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Epic as EpicType} from "~/types/db/Products"

import EpicDrawer from "./EpicDrawer"
import AutoSizingInput from "../AutoSizingInput"
import {updateEpic} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

export type EpicContentProps = {
	epic: EpicType
}

const EpicContent: ForwardRefRenderFunction<HTMLDivElement, EpicContentProps> = ({epic}, ref) => {
	const [activeProduct, setActiveProduct] = useAtom(activeProductAtom)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const updateLocalEpicName = (newName: string) => {
		setActiveProduct((state) =>
			produce(state, (draft) => {
				const index = draft!.storyMapState.epics.findIndex((oldEpic) => oldEpic.id === epic.id)
				draft!.storyMapState.epics[index]!.name = newName
			}),
		)
	}

	return (
		<>
			<div
				className="flex min-w-[4rem] items-center gap-2 rounded-md border border-[#4f2dc8] bg-white px-2 py-1 text-[#4f2dc8]"
				ref={ref}
			>
				<button
					type="button"
					onClick={() => void setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => void e.stopPropagation()}
				>
					<ReadOutlined />
				</button>
				<AutoSizingInput
					value={epic.name}
					onChange={(value) => {
						updateLocalEpicName(value)
						updateEpic({storyMapState: activeProduct!.storyMapState, epicId: epic.id, data: {name: value}})
					}}
					inputStateId={epic.nameInputStateId}
					inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
				/>
			</div>

			<EpicDrawer epic={epic} isOpen={isDrawerOpen} onClose={() => void setIsDrawerOpen(false)} />
		</>
	)
}

export default forwardRef(EpicContent)
