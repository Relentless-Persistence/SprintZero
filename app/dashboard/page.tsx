"use client"

import {LeftOutlined, RightOutlined} from "@ant-design/icons"
import {useQuery} from "@tanstack/react-query"
import {Breadcrumb, Button} from "antd5"
import {useLayoutEffect} from "react"

import type {FC} from "react"

import {useStoryMapStore} from "./storyMapStore"
import {sortEpics, sortFeatures, sortStories} from "./utils"
import VersionList from "./VersionList"
import StoryMap from "~/app/dashboard/StoryMap"
import useMainStore from "~/stores/mainStore"
import {getAllEpics, getAllVersions, getFeaturesByEpic, getStoriesByFeature} from "~/utils/fetch"

const layerBoundaries = [62, 124]
const visualizeCellBoundaries = true

const Dashboard: FC = () => {
	const activeProduct = useMainStore((state) => state.activeProduct)
	const currentVersion = useStoryMapStore((state) => state.currentVersion)
	const setCurrentVersion = useStoryMapStore((state) => state.setCurrentVersion)
	const setNewVersionInput = useStoryMapStore((state) => state.setNewVersionInput)

	const {data: versions} = useQuery({
		queryKey: [`all-versions`, activeProduct],
		queryFn: getAllVersions(activeProduct!),
		onSuccess: (versions) => {
			if (currentVersion === `` && versions[0]) setCurrentVersion(versions[0].id)
		},
		enabled: activeProduct !== null,
	})

	const setEpics = useStoryMapStore((state) => state.setEpics)
	const setFeatures = useStoryMapStore((state) => state.setFeatures)
	const setStories = useStoryMapStore((state) => state.setStories)

	const {data: epics, isSuccess: isSuccessEpics} = useQuery({
		queryKey: [`all-epics`, activeProduct],
		queryFn: getAllEpics(activeProduct!),
		select: (epicList) => sortEpics(epicList),
		onSuccess: (epics) => void setEpics(epics),
		enabled: activeProduct !== null,
		staleTime: Infinity,
	})

	const epicIds = epics?.map((epic) => epic.id) ?? []
	const {data: features, isSuccess: isSuccessFeatures} = useQuery({
		queryKey: [`all-features`, epicIds],
		queryFn: async () => await Promise.all(epicIds.map((epicId) => getFeaturesByEpic(epicId)())),
		select: (data) => data.map((featureList) => sortFeatures(featureList)).flat(),
		onSuccess: (features) => void setFeatures(features),
		enabled: epics !== undefined,
		staleTime: Infinity,
	})

	const featureIds = features?.map((feature) => feature.id) ?? []
	const {isSuccess: isSuccessStories} = useQuery({
		queryKey: [`all-stories`, featureIds],
		queryFn: async () => await Promise.all(featureIds.map((featureId) => getStoriesByFeature(featureId)())),
		select: (data) => data.map((storyList) => sortStories(storyList)).flat(),
		onSuccess: (stories) => void setStories(stories),
		enabled: features !== undefined,
		staleTime: Infinity,
	})

	const finishedFetching = isSuccessEpics && isSuccessFeatures && isSuccessStories

	const calculateDividers = useStoryMapStore((state) => state.calculateDividers)
	useLayoutEffect(() => {
		calculateDividers()
	}, [calculateDividers, currentVersion])
	const dividers = useStoryMapStore((state) => state.dividers)

	return (
		<div className="grid h-full grid-cols-[1fr_minmax(6rem,max-content)]">
			<div className="flex flex-col gap-8">
				<div className="flex justify-between px-12 pt-8">
					<Breadcrumb>
						<Breadcrumb.Item>Story Map</Breadcrumb.Item>
						<Breadcrumb.Item>{versions?.find((version) => version.id === currentVersion)?.name}</Breadcrumb.Item>
					</Breadcrumb>

					<Button onClick={() => void setNewVersionInput(``)}>+ Add version</Button>
				</div>
				<div className="px-12 text-laurel">
					<div className="relative text-[0.6rem]">
						<LeftOutlined className="absolute left-[-6px] -translate-y-1/2" />
						<div className="absolute top-1/2 h-0 w-full -translate-y-1/2 border-t-[1px] border-dashed border-laurel" />
						<RightOutlined className="absolute right-[-6px] -translate-y-1/2" />
					</div>
					<div className="mt-2 flex justify-between text-xs">
						<p>Low value</p>
						<p>High value</p>
					</div>
				</div>

				<div className="relative w-full grow">
					<div className="absolute inset-0 overflow-x-auto px-12 pb-8">
						{finishedFetching && (
							<>
								<StoryMap />
								{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
								{visualizeCellBoundaries && (
									<div className="pointer-events-none absolute inset-0">
										<div className="absolute w-full" style={{height: `${layerBoundaries[0]}px`, top: `0px`}}>
											{dividers[0]?.map((divider) => (
												<div
													key={`divider-0-${divider.pos}`}
													className="absolute top-0 h-full w-px border-[1px] border-dashed border-[red]"
													style={{left: divider.pos}}
												/>
											))}
										</div>
										<div
											className="absolute w-full"
											style={{
												height: `${(layerBoundaries[1] ?? 0) - (layerBoundaries[0] ?? 0)}px`,
												top: `${layerBoundaries[0]}px`,
											}}
										>
											{dividers[1]?.map((divider) => (
												<div
													key={`divider-1-${divider.pos}`}
													className="absolute top-0 h-full w-px border-[1px] border-dashed border-[green]"
													style={{left: divider.pos}}
												/>
											))}
										</div>
										<div className="absolute w-full" style={{height: `300px`, top: `${layerBoundaries[1]}px`}}>
											{dividers[2]?.map((divider) => (
												<div
													key={`divider-2-${divider.pos}`}
													className="absolute top-0 h-full w-px border-[1px] border-dashed border-[blue]"
													style={{left: divider.pos}}
												/>
											))}
										</div>
									</div>
								)}
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
