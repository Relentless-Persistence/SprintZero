"use client"

import {useQueryClient} from "@tanstack/react-query"
import {useAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Story as StoryType} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {storyMapStateAtom} from "../atoms"
import StoryDrawer from "~/components/StoryDrawer"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type StoryContentProps = {
	story: StoryType
}

const StoryContent: ForwardRefRenderFunction<HTMLDivElement, StoryContentProps> = ({story}, ref) => {
	const activeProductId = useActiveProductId()
	const [storyMapState, setStoryMapState] = useAtom(storyMapStateAtom)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const version = useQueryClient()
		.getQueryData<Version[]>([`all-versions`, activeProductId])
		?.find((version) => version.id === story.versionId)

	return (
		<>
			<div
				className="flex min-w-[4rem] items-center gap-1 overflow-hidden rounded border border-laurel bg-green-t1300 pr-1 text-laurel"
				ref={ref}
			>
				<button
					type="button"
					onClick={() => void setIsDrawerOpen(true)}
					onPointerDownCapture={(e) => void e.stopPropagation()}
					className="border-r-[1px] border-laurel bg-green-t1200 p-0.5 text-[0.6rem]"
				>
					<p className="-rotate-90">{version?.name}</p>
				</button>
				<div className="mx-auto px-1 text-xs text-black">
					<p>{story.name}</p>
				</div>
			</div>

			{storyMapState && (
				<StoryDrawer
					storyMapState={storyMapState}
					setStoryMapState={setStoryMapState}
					story={story}
					hideAdjudicationResponse
					isOpen={isDrawerOpen}
					onClose={() => void setIsDrawerOpen(false)}
				/>
			)}
		</>
	)
}

export default forwardRef(StoryContent)
