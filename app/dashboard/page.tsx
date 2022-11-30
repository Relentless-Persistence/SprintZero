"use client"

import {LeftOutlined, RightOutlined} from "@ant-design/icons"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Breadcrumb, Button, Input, Menu} from "antd5"
import {useEffect, useLayoutEffect, useState} from "react"

import type {FC} from "react"

import {useStoryMapStore} from "./storyMapStore"
import StoryMap from "~/app/dashboard/StoryMap"
import useMainStore from "~/stores/mainStore"
import {addVersion, getAllEpics, getAllVersions, getFeaturesByEpic, getStoriesByFeature} from "~/utils/fetch"

const Dashboard: FC = () => {
	const queryClient = useQueryClient()
	const activeProductId = useMainStore((state) => state.activeProductId)
	const currentVersion = useStoryMapStore((state) => state.currentVersion)
	const setCurrentVersion = useStoryMapStore((state) => state.setCurrentVersion)
	const [newVersionInput, setNewVersionInput] = useState<string | null>(null)

	const {data: versions} = useQuery({
		queryKey: [`all-versions`, activeProductId],
		queryFn: getAllVersions(activeProductId!),
		enabled: activeProductId !== null,
	})

	useEffect(() => {
		if (currentVersion === `` && versions?.[0]) setCurrentVersion(versions[0].id)
	}, [setCurrentVersion, currentVersion, versions])

	const addVersionMutation = useMutation({
		mutationFn: activeProductId ? addVersion(activeProductId) : async () => {},
		onSuccess: () => {
			setNewVersionInput(null)
			queryClient.invalidateQueries({queryKey: [`allVersions`, activeProductId], exact: true})
		},
	})

	const setEpics = useStoryMapStore((state) => state.setEpics)
	const setFeatures = useStoryMapStore((state) => state.setFeatures)
	const setStories = useStoryMapStore((state) => state.setStories)

	const {data: epics, isSuccess: isSuccessEpics} = useQuery({
		queryKey: [`all-epics`, activeProductId],
		queryFn: getAllEpics(activeProductId!),
		select: (data) =>
			data.sort((epic1, epic2) => {
				// Sort epics by prevEpic and nextEpic
				if (epic1.prevEpic === null) return -1
				if (epic2.prevEpic === null) return 1
				if (epic1.prevEpic === epic2.id) return 1
				if (epic2.prevEpic === epic1.id) return -1
				return 0
			}),
		onSuccess: (epics) => void setEpics(epics),
		enabled: activeProductId !== null,
		staleTime: Infinity,
	})

	const epicIds = epics?.map((epic) => epic.id) ?? []
	const {data: features, isSuccess: isSuccessFeatures} = useQuery({
		queryKey: [`all-features`, epicIds],
		queryFn: async () => await Promise.all(epicIds.map((epicId) => getFeaturesByEpic(epicId)())),
		select: (data) =>
			data
				.map((featureList) =>
					featureList.sort((feature1, feature2) => {
						if (feature1.prevFeature === null) return -1
						if (feature2.prevFeature === null) return 1
						if (feature1.prevFeature === feature2.id) return 1
						if (feature2.prevFeature === feature1.id) return -1
						return 0
					}),
				)
				.flat(),
		onSuccess: (features) => void setFeatures(features),
		enabled: epics !== undefined,
		staleTime: Infinity,
	})

	const featureIds = features?.map((feature) => feature.id) ?? []
	const {isSuccess: isSuccessStories} = useQuery({
		queryKey: [`all-stories`, featureIds],
		queryFn: async () => await Promise.all(featureIds.map((featureId) => getStoriesByFeature(featureId)())),
		select: (data) =>
			data
				.map((storyList) =>
					storyList.sort((story1, story2) => {
						if (story1.prevStory === null) return -1
						if (story2.prevStory === null) return 1
						if (story1.prevStory === story2.id) return 1
						if (story2.prevStory === story1.id) return -1
						return 0
					}),
				)
				.flat(),
		onSuccess: (stories) => void setStories(stories),
		enabled: features !== undefined,
		staleTime: Infinity,
	})

	const finishedFetching = isSuccessEpics && isSuccessFeatures && isSuccessStories

	const allElementsRegistered = useStoryMapStore((state) => state.allElementsRegistered)
	const calculateDividers = useStoryMapStore((state) => state.calculateDividers)
	useLayoutEffect(() => {
		if (allElementsRegistered) calculateDividers()
	}, [allElementsRegistered, calculateDividers, currentVersion])

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
					<div className="absolute inset-0 overflow-x-auto px-12 pb-8">{finishedFetching && <StoryMap />}</div>
				</div>
			</div>

			<div>
				<Menu
					selectedKeys={[currentVersion]}
					items={[
						...(versions ?? []).map((version) => ({
							key: version.id,
							label: version.name,
							onClick: () => void setCurrentVersion(version.id),
						})),
						{key: `__ALL_VERSIONS__`, label: `All`, onClick: () => void setCurrentVersion(`__ALL_VERSIONS__`)},
					]}
				/>
				{newVersionInput !== null && (
					<form
						onSubmit={(evt) => {
							evt.preventDefault()
							addVersionMutation.mutate(newVersionInput)
						}}
						className="flex flex-col gap-2"
					>
						<Input
							value={newVersionInput}
							onChange={(evt) => void setNewVersionInput(evt.target.value)}
							htmlSize={1}
							className="w-full"
						/>
						<Button htmlType="submit">Add</Button>
						{addVersionMutation.isError && addVersionMutation.error instanceof Error && (
							<p>{addVersionMutation.error.message}</p>
						)}
					</form>
				)}
			</div>
		</div>
	)
}

export default Dashboard
