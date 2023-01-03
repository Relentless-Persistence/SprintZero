"use client"

import {useAtomValue, useSetAtom} from "jotai"
import {useLayoutEffect} from "react"

import type {FC} from "react"

import {calculateDividersAtom, currentVersionAtom} from "./atoms"
import StoryMapHeader from "./StoryMapHeader"
import TreeLines from "./TreeLines"
import {useGetInitialData} from "./utils"
import VersionList from "./VersionList"
// import VisualizeCellBoundaries from "./VisualizeCellBoundaries"
import StoryMap from "~/app/[productSlug]/dashboard/StoryMap"

const Dashboard: FC = () => {
	const currentVersion = useAtomValue(currentVersionAtom)

	const finishedFetching = useGetInitialData()

	const calculateDividers = useSetAtom(calculateDividersAtom)
	useLayoutEffect(() => void calculateDividers(), [calculateDividers, currentVersion])

	return (
		<div className="grid h-full grid-cols-[1fr_minmax(6rem,max-content)]">
			<div className="flex flex-col gap-8">
				<StoryMapHeader />

				<div className="relative w-full grow">
					<div className="absolute inset-0 overflow-x-auto px-12 pb-8 pt-2">
						{finishedFetching && (
							<>
								<TreeLines />
								<StoryMap />
								{/* <VisualizeCellBoundaries /> */}
							</>
						)}
					</div>
				</div>
			</div>

			<VersionList />
		</div>
	)
}

export default Dashboard
