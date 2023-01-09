"use client"

import {motion} from "framer-motion"
import {useAtomValue} from "jotai"
import {useEffect} from "react"

import type {FC} from "react"

import {storyMapStateAtom} from "./storyMap/atoms"
import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {pointerLocation, storyMapScrollPosition, getTargetPosition} from "./storyMap/utils"
import VersionList from "./VersionList"

const Dashboard: FC = () => {
	const storyMapState = useAtomValue(storyMapStateAtom)

	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			pointerLocation[0] = e.clientX
			pointerLocation[1] = e.clientY
			getTargetPosition(storyMapState)
		}
		window.addEventListener(`pointermove`, handlePointerMove)

		return () => void window.removeEventListener(`pointermove`, handlePointerMove)
	}, [storyMapState])

	return (
		<div className="grid h-full grid-cols-[1fr_minmax(6rem,max-content)]">
			<div className="flex flex-col gap-8">
				<StoryMapHeader />

				<div className="relative w-full grow">
					<motion.div
						layoutScroll
						className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2"
						onScroll={(e) => {
							storyMapScrollPosition.position = e.currentTarget.scrollLeft
							getTargetPosition(storyMapState)
						}}
					>
						<StoryMap />
					</motion.div>
				</div>
			</div>

			<VersionList />

			<div
				className="pointer-events-none fixed z-50 rounded border transition-[left,top,width,height,background,border-color]"
				id="indicator"
			/>
		</div>
	)
}

export default Dashboard
