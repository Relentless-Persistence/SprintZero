"use client"

import {useAtomValue} from "jotai"
import {useEffect} from "react"

import type {FC} from "react"

import {storyMapStateAtom} from "./storyMap/atoms"
import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {cursorLocationPixels, storyMapScrollPosition, updateCursorLocation} from "./storyMap/utils"
import VersionList from "./VersionList"

const Dashboard: FC = () => {
	const storyMapState = useAtomValue(storyMapStateAtom)

	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			cursorLocationPixels[0] = e.clientX
			cursorLocationPixels[1] = e.clientY
			updateCursorLocation(storyMapState)
		}
		window.addEventListener(`pointermove`, handlePointerMove)

		return () => void window.removeEventListener(`pointermove`, handlePointerMove)
	}, [storyMapState])

	return (
		<div className="grid h-full grid-cols-[1fr_minmax(6rem,max-content)]">
			<div className="flex flex-col gap-8">
				<StoryMapHeader />

				<div className="relative w-full grow">
					<div
						className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2"
						onScroll={(e) => {
							storyMapScrollPosition.position = e.currentTarget.scrollLeft
							updateCursorLocation(storyMapState)
						}}
					>
						<StoryMap />
					</div>
				</div>
			</div>

			<VersionList />

			<div
				className="pointer-events-none fixed z-50 rounded border border-sky/40 bg-sky/20 transition-[left,top,width,height]"
				id="indicator"
			/>
		</div>
	)
}

export default Dashboard
