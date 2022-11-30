import {useQuery} from "@tanstack/react-query"
import {collection, onSnapshot, query, where} from "firebase9/firestore"
import {useEffect} from "react"

import type {WritableDraft} from "immer/dist/types/types-external"
import type {Id} from "~/types"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Story} from "~/types/db/Stories"

import {useStoryMapStore} from "./storyMapStore"
import {db} from "~/config/firebase"
import useMainStore from "~/stores/mainStore"
import {EpicCollectionSchema, Epics} from "~/types/db/Epics"
import {FeatureCollectionSchema, Features} from "~/types/db/Features"
import {Stories, StoryCollectionSchema} from "~/types/db/Stories"
import {getAllEpics, getAllFeatures, getAllStories} from "~/utils/fetch"

export const avg = (...arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

export const sortEpics = (epics: Epic[]): Epic[] =>
	epics.sort((epic1, epic2) => {
		if (epic1.prevEpic === null) return -1
		if (epic2.prevEpic === null) return 1
		if (epic1.prevEpic === epic2.id) return 1
		if (epic2.prevEpic === epic1.id) return -1
		return 0
	})

// Relies on epics being sorted
export const sortFeatures = (epics: Epic[], features: Feature[]): Feature[] =>
	features
		.sort((feature1, feature2) => {
			const feature1Epic = epics.findIndex((epic) => epic.id === feature1.epic)
			const feature2Epic = epics.findIndex((epic) => epic.id === feature2.epic)
			if (feature1Epic < feature2Epic) return -1
			if (feature1Epic > feature2Epic) return 1
			return 0
		})
		.sort((feature1, feature2) => {
			if (feature1.nextFeature === null && feature2.prevFeature === null) return -1
			if (feature1.prevFeature === feature2.id) return 1
			if (feature2.prevFeature === feature1.id) return -1
			return 0
		})

// Relies on features being sorted
export const sortStories = (features: Feature[], stories: Story[]): Story[] =>
	stories
		.sort((story1, story2) => {
			const story1Feature = features.findIndex((feature) => feature.id === story1.feature)
			const story2Feature = features.findIndex((feature) => feature.id === story2.feature)
			if (story1Feature < story2Feature) return -1
			if (story1Feature > story2Feature) return 1
			return 0
		})
		.sort((story1, story2) => {
			if (story1.nextStory === null && story2.prevStory === null) return -1
			if (story1.prevStory === story2.id) return 1
			if (story2.prevStory === story1.id) return -1
			return 0
		})

// Once this hook has run, the story map will mount. That way, we can always rely on there being data available.
export const useGetInitialData = (): boolean => {
	const activeProduct = useMainStore((state) => state.activeProduct)

	const setEpics = useStoryMapStore((state) => state.setEpics)
	const setFeatures = useStoryMapStore((state) => state.setFeatures)
	const setStories = useStoryMapStore((state) => state.setStories)

	const {isSuccess: isSuccessEpics} = useQuery({
		queryKey: [`all-epics`, activeProduct],
		queryFn: getAllEpics(activeProduct!),
		onSuccess: (epics) => void setEpics(epics),
		enabled: activeProduct !== null,
		staleTime: Infinity,
	})

	const {isSuccess: isSuccessFeatures} = useQuery({
		queryKey: [`all-features`, activeProduct],
		queryFn: getAllFeatures(activeProduct!),
		onSuccess: (features) => void setFeatures(features),
		enabled: activeProduct !== null,
		staleTime: Infinity,
	})

	const {isSuccess: isSuccessStories} = useQuery({
		queryKey: [`all-stories`, activeProduct],
		queryFn: getAllStories(activeProduct!),
		onSuccess: (stories) => void setStories(stories),
		enabled: activeProduct !== null,
		staleTime: Infinity,
	})

	const finishedFetching = isSuccessEpics && isSuccessFeatures && isSuccessStories
	return finishedFetching
}

export const useSubscribeToData = (): void => {
	const activeProduct = useMainStore((state) => state.activeProduct)

	const setEpics = useStoryMapStore((state) => state.setEpics)
	const setFeatures = useStoryMapStore((state) => state.setFeatures)
	const setStories = useStoryMapStore((state) => state.setStories)
	const calculateDividers = useStoryMapStore((state) => state.calculateDividers)

	useEffect(() => {
		const unsubscribeEpics = onSnapshot(
			query(collection(db, Epics._), where(Epics.product, `==`, activeProduct)),
			(doc) => {
				const data = EpicCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setEpics(data)
			},
		)

		const unsubscribeFeatures = onSnapshot(
			query(collection(db, Features._), where(Features.product, `==`, activeProduct)),
			(doc) => {
				const data = FeatureCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setFeatures(data)
			},
		)

		const unsubscribeStories = onSnapshot(
			query(collection(db, Stories._), where(Stories.product, `==`, activeProduct)),
			(doc) => {
				const data = StoryCollectionSchema.parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setStories(data)
			},
		)

		return () => {
			unsubscribeEpics()
			unsubscribeFeatures()
			unsubscribeStories()
		}
	}, [activeProduct, calculateDividers, setEpics, setFeatures, setStories])
}

export type Divider = {
	pos: number
	border: boolean
}

export type StoryMapStore = {
	currentVersion: Id | `__ALL_VERSIONS__`
	setCurrentVersion: (version: Id | `__ALL_VERSIONS__`) => void
	newVersionInput: string | null
	setNewVersionInput: (version: string | null) => void

	epics: Array<{element?: HTMLElement; epic: Epic}>
	setEpics: (epics: Epic[]) => void
	features: Array<{element?: HTMLElement; feature: Feature}>
	setFeatures: (feature: Feature[]) => void
	stories: Array<{element?: HTMLElement; story: Story}>
	setStories: (story: Story[]) => void

	currentlyHovering: [Id | null, Id | null, Id | null]
	setCurrentLayerHover: (layer: number, id: Id | null) => void

	dividers: [Divider[] | null, Divider[] | null, Divider[] | null]
	registerElement: (layer: number, id: Id, element: HTMLElement) => void
	calculateDividers: () => void
}

export const calculateDividers = (state: WritableDraft<StoryMapStore>): void => {
	if (
		state.epics.every((epic) => epic.element) &&
		state.features.every((feature) => feature.element) &&
		state.stories.every((story) => story.element)
	) {
		let epicPositions: Divider[] = []
		state.epics.forEach((epic, i) => {
			const epicPos = epic.element!.offsetLeft + epic.element!.offsetWidth / 2
			if (i === 0) {
				epicPositions.push({pos: epicPos, border: false})
			} else {
				epicPositions.push({pos: avg(epicPositions.at(-1)!.pos, epicPos), border: false})
				epicPositions.push({pos: epicPos, border: false})
			}
		})

		let featurePositions: Divider[] = []
		state.features.forEach((feature, i) => {
			const featurePos = feature.element!.offsetLeft + feature.element!.offsetWidth / 2
			if (i === 0) {
				featurePositions.push({pos: featurePos, border: false})
			} else {
				featurePositions.push({
					pos: avg(featurePositions.at(-1)!.pos, featurePos),
					border: feature.feature.prevFeature === null,
				})
				featurePositions.push({pos: featurePos, border: false})
			}
		})

		let storyPositions: Divider[] = []
		state.stories.forEach((story, i) => {
			const storyPos = story.element!.offsetTop + story.element!.offsetHeight / 2
			if (i === 0) {
				storyPositions.push({pos: storyPos, border: false})
			} else {
				storyPositions.push({
					pos: avg(storyPositions.at(-1)!.pos, storyPos),
					border: story.story.prevStory === null,
				})
				storyPositions.push({pos: storyPos, border: false})
			}
		})

		state.dividers = [epicPositions, featurePositions, storyPositions]
	}
}
