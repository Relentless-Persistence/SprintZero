import {ReadOutlined} from "@ant-design/icons"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {WithDocumentData} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"

import EpicDrawer from "./EpicDrawer"

export type EpicContentProps = {
	storyMapState: WithDocumentData<StoryMapState>
	epicId: string
}

const EpicContent: ForwardRefRenderFunction<HTMLDivElement, EpicContentProps> = ({storyMapState, epicId}, ref) => {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const epic = storyMapState.epics.find((epic) => epic.id === epicId)!

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
				<p>{epic.name}</p>
			</div>

			<EpicDrawer
				storyMapState={storyMapState}
				epicId={epicId}
				isOpen={isDrawerOpen}
				onClose={() => void setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default forwardRef(EpicContent)
