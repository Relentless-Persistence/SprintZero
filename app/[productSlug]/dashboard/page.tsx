"use client"

import {motion} from "framer-motion"
import {useEffect} from "react"

import type {FC} from "react"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {pointerLocation, storyMapScrollPosition} from "./storyMap/utils"
import VersionList from "./VersionList"

const Dashboard: FC = () => {
	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			pointerLocation[0] = e.clientX
			pointerLocation[1] = e.clientY
		}
		window.addEventListener(`pointermove`, handlePointerMove)

		return () => void window.removeEventListener(`pointermove`, handlePointerMove)
	}, [])

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
						}}
					>
						<StoryMap />
					</motion.div>
				</div>
			</div>

			<VersionList />
		</div>
	)
}

export default Dashboard
