"use client"

import {LeftOutlined, RightOutlined} from "@ant-design/icons"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import {Breadcrumb, Button, Input, Menu} from "antd5"
import {collection, onSnapshot, query, where} from "firebase9/firestore"
import {useEffect, useLayoutEffect, useRef, useState} from "react"

import type {FC} from "react"
import type {Epic as EpicType} from "~/types/db/Epics"
import type {Feature as FeatureType} from "~/types/db/Features"
import type {Story as StoryType} from "~/types/db/Stories"

import {useFinishedFetching, useStoryMapStore} from "./storyMapStore"
import StoryMap from "~/app/dashboard/StoryMap"
import {db} from "~/config/firebase"
import useMainStore from "~/stores/mainStore"
import {EpicCollectionSchema, Epics} from "~/types/db/Epics"
import {FeatureCollectionSchema, Features} from "~/types/db/Features"
import {Stories, StoryCollectionSchema} from "~/types/db/Stories"
import {addVersion, getAllVersions} from "~/utils/fetch"

const Dashboard: FC = () => {
	const queryClient = useQueryClient()
	const activeProductId = useMainStore((state) => state.activeProductId)
	const currentVersion = useStoryMapStore((state) => state.currentVersion)
	const setCurrentVersion = useStoryMapStore((state) => state.setCurrentVersion)
	const fetchedEpics = useStoryMapStore((state) => state.fetchedEpics)
	const fetchedFeatures = useStoryMapStore((state) => state.fetchedFeatures)
	const fetchedStories = useStoryMapStore((state) => state.fetchedStories)
	const initialize = useStoryMapStore((state) => state.initialize)
	const [newVersionInput, setNewVersionInput] = useState<string | null>(null)

	const {data: versions} = useQuery({
		queryKey: [`allVersions`, activeProductId],
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

	const data = useRef({
		epics: [] as EpicType[],
		features: [] as FeatureType[],
		stories: [] as StoryType[],
	})
	useEffect(() => {
		if (!activeProductId) return

		const unsubscribeEpics = onSnapshot(
			query(collection(db, Epics._), where(Epics.product, `==`, activeProductId)),
			(doc) => {
				data.current.epics = EpicCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				fetchedEpics()
			},
		)

		const unsubscribeFeatures = onSnapshot(
			query(collection(db, Features._), where(Features.product, `==`, activeProductId)),
			(doc) => {
				data.current.features = FeatureCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				fetchedFeatures()
			},
		)

		const unsubscribeStories = onSnapshot(
			query(collection(db, Stories._), where(Stories.product, `==`, activeProductId)),
			(doc) => {
				data.current.stories = StoryCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				fetchedStories()
			},
		)

		return () => {
			unsubscribeEpics()
			unsubscribeFeatures()
			unsubscribeStories()
		}
	}, [activeProductId, fetchedEpics, fetchedFeatures, fetchedStories])

	const finishedFetching = useFinishedFetching()
	useLayoutEffect(() => {
		if (finishedFetching) initialize(data.current.epics, data.current.features, data.current.stories)
	}, [initialize, finishedFetching])

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
						<StoryMap />
					</div>
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
