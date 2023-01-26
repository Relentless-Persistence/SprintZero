"use client"

import {useQueryClient} from "@tanstack/react-query"
import produce from "immer"
import {useAtom} from "jotai"
import {forwardRef, useState} from "react"

import type {ForwardRefRenderFunction} from "react"
import type {Story as StoryType} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import StoryDrawer from "./StoryDrawer"
import AutoSizingInput from "../AutoSizingInput"
import {updateStory} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

export type StoryContentProps = {
	story: StoryType
}

const StoryContent: ForwardRefRenderFunction<HTMLDivElement, StoryContentProps> = ({story}, ref) => {
	const [activeProduct, setActiveProduct] = useAtom(activeProductAtom)
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const version = useQueryClient()
		.getQueryData<Version[]>([`all-versions`, activeProduct?.id])
		?.find((version) => version.id === story.versionId)

	const updateLocalStoryName = (newName: string) => {
		setActiveProduct((activeProduct) =>
			produce(activeProduct, (draft) => {
				draft!.storyMapState.stories.find(({id}) => id === story.id)!.name = newName
			}),
		)
	}

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
					<AutoSizingInput
						value={story.name}
						onChange={(value) => {
							updateLocalStoryName(value)
							updateStory({storyMapState: activeProduct!.storyMapState, storyId: story.id, data: {name: value}})
						}}
						inputStateId={story.nameInputStateId}
						inputProps={{onPointerDownCapture: (e: React.PointerEvent<HTMLInputElement>) => void e.stopPropagation()}}
					/>
				</div>
			</div>

			<StoryDrawer story={story} isOpen={isDrawerOpen} onClose={() => void setIsDrawerOpen(false)} />
		</>
	)
}

export default forwardRef(StoryContent)
