"use client"

import type {FC} from "react"

import StoryMap from "./storyMap/StoryMap"
import StoryMapHeader from "./storyMap/StoryMapHeader"
import {useGetInitialData} from "./storyMap/utils"
import VersionList from "./VersionList"

const Dashboard: FC = () => {
	const finishedFetching = useGetInitialData()

	return (
		<div className="grid h-full grid-cols-[1fr_minmax(6rem,max-content)]">
			<div className="flex flex-col gap-8">
				<StoryMapHeader />

				<div className="relative w-full grow">
					<div className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2">{finishedFetching && <StoryMap />}</div>
				</div>
			</div>

			<VersionList />
		</div>
	)
}

export default Dashboard
