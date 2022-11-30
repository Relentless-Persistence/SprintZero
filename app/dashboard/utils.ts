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

export const sortEpics = (epics: Epic[]): Epic[] => {
	const sortedEpics: Epic[] = []
	let currentEpic = epics.find((epic) => epic.prev_epic === null) || null
	while (currentEpic) {
		sortedEpics.push(currentEpic)
		currentEpic = epics.find((epic) => epic.prev_epic === currentEpic!.id) || null
	}
	return sortedEpics
}

// Relies on epics being sorted
export const sortFeatures = (epics: Epic[], features: Feature[]): Feature[] => {
	const sortedFeatures: Feature[] = []
	epics.forEach((epic) => {
		let currentFeature = features.find((feature) => feature.prev_feature === null && feature.epic === epic.id) || null
		while (currentFeature) {
			sortedFeatures.push(currentFeature)
			currentFeature = features.find((feature) => feature.prev_feature === currentFeature!.id) || null
		}
	})
	return sortedFeatures
}

// Relies on features being sorted
export const sortStories = (features: Feature[], stories: Story[]): Story[] => {
	const sortedStories: Story[] = []
	features.forEach((feature) => {
		let currentStory = stories.find((story) => story.prev_story === null && story.feature === feature.id) || null
		while (currentStory) {
			sortedStories.push(currentStory)
			currentStory = stories.find((story) => story.prev_story === currentStory!.id) || null
		}
	})
	return sortedStories
}

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

export type FeatureDivider = {
	pos: number
	border: boolean
}

export type StoryDivider = {
	featureId: Id
	featureLeft: number
	featureRight: number
	dividers: number[]
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

	dividers: [number[] | null, FeatureDivider[] | null, Array<StoryDivider> | null]
	registerElement: (layer: number, id: Id, element: HTMLElement) => void
	calculateDividers: () => void
}

export const calculateDividers = (state: WritableDraft<StoryMapStore>): void => {
	if (
		state.epics.every((epic) => epic.element) &&
		state.features.every((feature) => feature.element) &&
		state.stories.every((story) => story.element)
	) {
		let epicDividers: number[] = []
		state.epics.forEach((epic, i) => {
			const epicPos = epic.element!.offsetLeft + epic.element!.offsetWidth / 2
			if (i > 0) epicDividers.push(avg(epicDividers.at(-1)!, epicPos))
			epicDividers.push(epicPos)
		})

		let featureDividers: FeatureDivider[] = []
		state.features.forEach((feature, i) => {
			const featurePos = feature.element!.offsetLeft + feature.element!.offsetWidth / 2
			if (i === 0) {
				featureDividers.push({pos: featurePos, border: false})
			} else {
				featureDividers.push({
					pos: avg(featureDividers.at(-1)!.pos, featurePos),
					border: feature.feature.prev_feature === null,
				})
				featureDividers.push({pos: featurePos, border: false})
			}
		})

		let storyDividers: StoryDivider[] = state.features.map((feature) => ({
			featureId: feature.feature.id,
			featureLeft: feature.element!.offsetLeft,
			featureRight: feature.element!.offsetLeft + feature.element!.offsetWidth,
			dividers: (() => {
				const stories = state.stories.filter((story) => story.story.feature === feature.feature.id)
				const dividers: number[] = []
				stories.forEach((story, i) => {
					const storyPos = story.element!.offsetTop + story.element!.offsetHeight / 2
					if (i > 0) dividers.push(avg(dividers.at(-1)!, storyPos))
					dividers.push(storyPos)
				})
				return dividers
			})(),
		}))

		state.dividers = [epicDividers, featureDividers, storyDividers]
	}
}
