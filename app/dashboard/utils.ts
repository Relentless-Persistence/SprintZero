import {useQuery} from "@tanstack/react-query"
import {collection, onSnapshot, query, where} from "firebase9/firestore"
import {useEffect} from "react"

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
export const sortFeatures = (sortedEpics: Epic[], features: Feature[]): Feature[] => {
	const sortedFeatures: Feature[] = []
	sortedEpics.forEach((epic) => {
		let currentFeature = features.find((feature) => feature.prev_feature === null && feature.epic === epic.id) || null
		while (currentFeature) {
			sortedFeatures.push(currentFeature)
			currentFeature = features.find((feature) => feature.prev_feature === currentFeature!.id) || null
		}
	})
	return sortedFeatures
}

// Relies on features being sorted
export const sortStories = (sortedFeatures: Feature[], stories: Story[]): Story[] => {
	const sortedStories: Story[] = []
	sortedFeatures.forEach((feature) => {
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

export const calculateDividers = (
	epics: Epic[],
	epicElements: Record<Id, HTMLElement | null>,
	features: Feature[],
	featureElements: Record<Id, HTMLElement | null>,
	stories: Story[],
	storyElements: Record<Id, HTMLElement | null>,
	currentVersion: Id | `__ALL_VERSIONS__`,
): [number[] | null, FeatureDivider[] | null, Array<StoryDivider> | null] | null => {
	if (
		epicsByCurrentVersion(epics, stories, currentVersion).every((epic) => !!epicElements[epic.id]) &&
		featuresByCurrentVersion(features, stories, currentVersion).every((feature) => !!featureElements[feature.id]) &&
		storiesByCurrentVersion(stories, currentVersion).every((story) => !!storyElements[story.id])
	) {
		let epicDividers: number[] = []
		epics.forEach((epic, i) => {
			const element = epicElements[epic.id]!
			const epicPos = element!.offsetLeft + element!.offsetWidth / 2
			if (i > 0) epicDividers.push(avg(epicDividers.at(-1)!, epicPos))
			epicDividers.push(epicPos)
		})

		let featureDividers: FeatureDivider[] = []
		features.forEach((feature, i) => {
			const element = featureElements[feature.id]!
			const featurePos = element!.offsetLeft + element!.offsetWidth / 2
			if (i === 0) {
				featureDividers.push({pos: featurePos, border: false})
			} else {
				featureDividers.push({
					pos: avg(featureDividers.at(-1)!.pos, featurePos),
					border: feature.prev_feature === null,
				})
				featureDividers.push({pos: featurePos, border: false})
			}
		})

		let storyDividers: StoryDivider[] = features.map((feature) => {
			const element = featureElements[feature.id]!
			return {
				featureId: feature.id,
				featureLeft: element!.offsetLeft,
				featureRight: element!.offsetLeft + element!.offsetWidth,
				dividers: (() => {
					const featureStories = stories.filter((story) => story.feature === feature.id)
					const dividers: number[] = []
					featureStories.forEach((story, i) => {
						const element = storyElements[story.id]!
						const storyPos = element!.offsetTop + element!.offsetHeight / 2
						if (i > 0) dividers.push(avg(dividers.at(-1)!, storyPos))
						dividers.push(storyPos)
					})
					return dividers
				})(),
			}
		})

		return [epicDividers, featureDividers, storyDividers]
	}
	return null
}

// A combination of epics containing stories with the current version and epics containing no stories
const epicsByCurrentVersion = (
	allEpics: Epic[],
	allStories: Story[],
	currentVersion: Id | `__ALL_VERSIONS__`,
): Epic[] => {
	if (currentVersion === `__ALL_VERSIONS__`) return allEpics

	const storiesWithCurrentVersion = allStories.filter((story) => story.version === currentVersion)
	const epicsWithCurrentVersion = storiesWithCurrentVersion.map((story) => story.epic)

	const epicsWithStories = allStories.map((story) => story.epic)
	const epicsWithoutStories = allEpics.filter((epic) => !epicsWithStories.includes(epic.id))

	const epicsToShow = [...new Set([...epicsWithCurrentVersion, ...epicsWithoutStories])]

	// To ensure that the epics are in the same order as in the state.epics array
	const epics = allEpics.filter((epic) => epicsToShow.includes(epic.id))
	return epics
}

// A combination of features containing stories with the current version and features containing no stories
const featuresByCurrentVersion = (
	allFeatures: Feature[],
	allStories: Story[],
	currentVersion: Id | `__ALL_VERSIONS__`,
): Feature[] => {
	if (currentVersion === `__ALL_VERSIONS__`) return allFeatures

	const storiesWithCurrentVersion = allStories.filter((story) => story.version === currentVersion)
	const featuresWithCurrentVersion = storiesWithCurrentVersion.map((story) => story.feature)

	const featuresWithStories = allStories.map((story) => story.feature)
	const featuresWithoutStories = allFeatures.filter((feature) => !featuresWithStories.includes(feature.id))

	const featuresToShow = [...new Set([...featuresWithCurrentVersion, ...featuresWithoutStories])]

	// To ensure that the features are in the same order as in the state.features array
	const features = allFeatures.filter((feature) => featuresToShow.includes(feature.id))
	return features
}

const storiesByCurrentVersion = (allStories: Story[], currentVersion: Id | `__ALL_VERSIONS__`): Story[] => {
	if (currentVersion === `__ALL_VERSIONS__`) return allStories
	return allStories.filter((story) => story.version === currentVersion)
}
