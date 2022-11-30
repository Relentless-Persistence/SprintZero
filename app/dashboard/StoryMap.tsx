"use client"

import {useMutation} from "@tanstack/react-query"
import {Button} from "antd5"
import {collection, onSnapshot, query, where} from "firebase9/firestore"
import {useEffect} from "react"

import type {FC} from "react"

import Epic from "./Epic"
import {useStoryMapStore} from "./storyMapStore"
import {sortEpics, sortFeatures, sortStories} from "./utils"
import {db} from "~/config/firebase"
import useMainStore from "~/stores/mainStore"
import {EpicCollectionSchema, Epics} from "~/types/db/Epics"
import {FeatureCollectionSchema, Features} from "~/types/db/Features"
import {Stories, StoryCollectionSchema} from "~/types/db/Stories"
import {addEpic} from "~/utils/fetch"

const StoryMap: FC = () => {
	const activeProduct = useMainStore((state) => state.activeProduct)

	const epics = useStoryMapStore((state) => state.epics.map((epic) => epic.epic))

	const addEpicMutation = useMutation({mutationFn: activeProduct ? addEpic(activeProduct) : async () => {}})

	const setEpics = useStoryMapStore((state) => state.setEpics)
	const setFeatures = useStoryMapStore((state) => state.setFeatures)
	const setStories = useStoryMapStore((state) => state.setStories)
	const calculateDividers = useStoryMapStore((state) => state.calculateDividers)
	useEffect(() => {
		const unsubscribeEpics = onSnapshot(
			query(collection(db, Epics._), where(Epics.product, `==`, activeProduct)),
			(doc) => {
				const data = EpicCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setEpics(sortEpics(data))
				calculateDividers()
			},
		)

		const unsubscribeFeatures = onSnapshot(
			query(collection(db, Features._), where(Features.product, `==`, activeProduct)),
			(doc) => {
				const data = FeatureCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setFeatures(sortFeatures(data))
				calculateDividers()
			},
		)

		const unsubscribeStories = onSnapshot(
			query(collection(db, Stories._), where(Stories.product, `==`, activeProduct)),
			(doc) => {
				const data = StoryCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setStories(sortStories(data))
				calculateDividers()
			},
		)

		return () => {
			unsubscribeEpics()
			unsubscribeFeatures()
			unsubscribeStories()
		}
	}, [activeProduct, calculateDividers, setEpics, setFeatures, setStories])

	return (
		<div className="flex w-max">
			<div className="flex gap-1">
				{epics.map((epic) => (
					<Epic key={epic!.id} epic={epic!} />
				))}
			</div>
			<div className="py-4 px-8">
				<Button
					onClick={() => void addEpicMutation.mutate({name: `Epic`, description: `description`})}
					className="bg-white"
				>
					Add epic
				</Button>
			</div>
		</div>
	)
}

export default StoryMap
