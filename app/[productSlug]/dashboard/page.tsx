"use client"

import {motion} from "framer-motion"
import {useAtomValue} from "jotai"

import type {FC} from "react"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {storyMapScrollPosition} from "./storyMap/utils/globals"
import VersionList from "./storyMap/VersionList"
import {setStoryMapState} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

const Dashboard: FC = () => {
	const activeProduct = useAtomValue(activeProductAtom)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex flex-col gap-8">
				<StoryMapHeader />

				<div className="relative w-full grow">
					<motion.div
						layoutScroll
						className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2"
						onScroll={(e) => {
							storyMapScrollPosition.current = e.currentTarget.scrollLeft
						}}
					>
						<StoryMap />
					</motion.div>
				</div>
			</div>

			<VersionList />

			<button
				type="button"
				className="fixed bottom-8 right-8 rounded-md border border-laurel px-2 py-1 text-laurel transition-colors hover:border-black hover:text-black"
				onClick={() =>
					void setStoryMapState({
						id: activeProduct!.storyMapStateId,
						data: {productId: activeProduct!.id, epics: [], features: [], stories: []},
					})
				}
			>
				Reset story map
			</button>
		</div>
	)
}

export default Dashboard
