import {useQuery} from "@tanstack/react-query"
import {collection, onSnapshot, query, where} from "firebase9/firestore"
import {useSetAtom} from "jotai"
import {useEffect} from "react"

import type {Id} from "~/types"

import {epicsAtom, featuresAtom, storiesAtom, storyMapStateAtom} from "./atoms"
import {db} from "~/config/firebase"
import {EpicSchema, Epics} from "~/types/db/Epics"
import {FeatureSchema, Features} from "~/types/db/Features"
import {StorySchema, Stories} from "~/types/db/Stories"
import {getEpicsByProduct, getFeaturesByProduct, getStoriesByProduct, getProduct} from "~/utils/api/queries"
import {useActiveProductId} from "~/utils/useActiveProductId"

declare global {
	interface Window {
		__elementRegistry: {
			epics: Record<Id, HTMLElement | null>
			features: Record<Id, HTMLElement | null>
			stories: Record<Id, HTMLElement | null>
		}
		__epicDividers: Record<Id, {left: number; right: number}>
		__featureDividers: Record<Id, {left: number; right: number}>
		__storyDividers: Record<Id, {top: number; bottom: number}>
	}
}

if (typeof window !== `undefined`) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__elementRegistry = window.__elementRegistry ?? {
		epics: {},
		features: {},
		stories: {},
	}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__epicDividers = window.__epicDividers ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__featureDividers = window.__featureDividers ?? {}
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	window.__storyDividers = window.__storyDividers ?? {}
}

export let elementRegistry = window.__elementRegistry
export const layerBoundaries: [number, number] = [54, 156]
export let epicDividers = window.__epicDividers
export let featureDividers = window.__featureDividers
export let storyDividers = window.__storyDividers

export const calculateDividers = (): void => {
	Object.entries(elementRegistry.epics).forEach(([id, element]: [id: Id, element: HTMLElement | null]) => {
		if (element) {
			epicDividers[id] = {
				left: element.offsetLeft,
				right: element.offsetLeft + element.offsetWidth,
			}
			// debugger
		} else {
			delete epicDividers[id]
		}
	})

	Object.entries(elementRegistry.features).forEach(([id, element]: [id: Id, element: HTMLElement | null]) => {
		if (element) {
			featureDividers[id] = {
				left: element.offsetLeft,
				right: element.offsetLeft + element.offsetWidth,
			}
		} else {
			delete featureDividers[id]
		}
	})

	Object.entries(elementRegistry.stories).forEach(([id, element]: [id: Id, element: HTMLElement | null]) => {
		if (element) {
			storyDividers[id] = {
				top: element.offsetTop,
				bottom: element.offsetTop + element.offsetHeight,
			}
		} else {
			delete storyDividers[id]
		}
	})

	// console.log(epicDividers)
}

export const avg = (...arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length

// We need to fetch all data before the story map mounts. This ensures that all elements are in the DOM immediately,
// which is important since we need to measure the element positions upon mount.
export const useGetInitialData = (): boolean => {
	const activeProduct = useActiveProductId()

	const setStoryMapState = useSetAtom(storyMapStateAtom)
	const setEpics = useSetAtom(epicsAtom)
	const setFeatures = useSetAtom(featuresAtom)
	const setStories = useSetAtom(storiesAtom)

	const {isSuccess: isSuccessStoryMapState} = useQuery({
		queryKey: [`product`, activeProduct],
		queryFn: getProduct(activeProduct!),
		enabled: activeProduct !== null,
		select: (product) => product.storyMapState,
		onSuccess: (storyMapState) => void setStoryMapState(storyMapState),
		staleTime: Infinity,
	})

	const {isSuccess: isSuccessEpics} = useQuery({
		queryKey: [`all-epics`, activeProduct],
		queryFn: getEpicsByProduct(activeProduct!),
		onSuccess: (epics) => void setEpics(epics),
		enabled: activeProduct !== null,
		staleTime: Infinity,
	})

	const {isSuccess: isSuccessFeatures} = useQuery({
		queryKey: [`all-features`, activeProduct],
		queryFn: getFeaturesByProduct(activeProduct!),
		onSuccess: (features) => void setFeatures(features),
		enabled: activeProduct !== null,
		staleTime: Infinity,
	})

	const {isSuccess: isSuccessStories} = useQuery({
		queryKey: [`all-stories`, activeProduct],
		queryFn: getStoriesByProduct(activeProduct!),
		onSuccess: (stories) => void setStories(stories),
		enabled: activeProduct !== null,
		staleTime: Infinity,
	})

	const finishedFetching = isSuccessStoryMapState && isSuccessEpics && isSuccessFeatures && isSuccessStories
	return finishedFetching
}

export const useSubscribeToData = (): void => {
	const activeProduct = useActiveProductId()

	const setEpics = useSetAtom(epicsAtom)
	const setFeatures = useSetAtom(featuresAtom)
	const setStories = useSetAtom(storiesAtom)

	useEffect(() => {
		const unsubscribeEpics = onSnapshot(
			query(collection(db, Epics._), where(Epics.product, `==`, activeProduct)),
			(doc) => {
				const data = EpicSchema.array().parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setEpics(data)
			},
		)

		const unsubscribeFeatures = onSnapshot(
			query(collection(db, Features._), where(Features.product, `==`, activeProduct)),
			(doc) => {
				const data = FeatureSchema.array().parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setFeatures(data)
			},
		)

		const unsubscribeStories = onSnapshot(
			query(collection(db, Stories._), where(Stories.product, `==`, activeProduct)),
			(doc) => {
				const data = StorySchema.array().parse(doc.docs.map((doc) => ({id: doc.id, ...doc.data()})))
				setStories(data)
			},
		)

		return () => {
			unsubscribeEpics()
			unsubscribeFeatures()
			unsubscribeStories()
		}
	}, [activeProduct, setEpics, setFeatures, setStories])
}

// export const useRegisterElement = (): ((update: {element: HTMLElement; id: Id}) => void) => {
// 	const setElements = useSetAtom(elementsAtom)

// 	return ({element, id}) => void setElements((prev) => ({...prev, [id]: element}))
// }

// export const useReportPendingDomChanges = (): ((update: {type: `create` | `update` | `delete`; id: Id}) => void) => {
// 	const setPendingDomChanges = useSetAtom(pendingDomChangesAtom)

// 	return (update) => void setPendingDomChanges((prev) => [...prev, update])
// }

// export const useCalculateDividers = (): ((reasons?: Id[]) => void) => {
// 	const storyMapState = useAtomValue(storyMapStateAtom)
// 	const epics = useAtomValue(epicsAtom)
// 	const features = useAtomValue(featuresAtom)
// 	const stories = useAtomValue(storiesAtom)
// 	const elements = useAtomValue(elementsAtom)
// 	const currentVersion = useAtomValue(currentVersionAtom)
// 	const setDividers = useSetAtom(dividersAtom)
// 	const setPendingDomChanges = useSetAtom(pendingDomChangesAtom)

// 	const allEpicsRegistered = epicsByCurrentVersion(epics, stories, currentVersion).every(
// 		(epic) => elements[epic.id] !== undefined,
// 	)
// 	const allFeaturesRegistered = featuresByCurrentVersion(features, stories, currentVersion).every(
// 		(feature) => elements[feature.id] !== undefined,
// 	)
// 	const allStoriesRegistered = storiesByCurrentVersion(stories, currentVersion).every(
// 		(story) => elements[story.id] !== undefined,
// 	)

// 	return (reasons) => {
// 		if (!allEpicsRegistered || !allFeaturesRegistered || !allStoriesRegistered) return

// 		let epicDividers: number[] = []
// 		storyMapState.forEach(({epic}, i) => {
// 			const element = elements[epic]!
// 			const epicPos = element!.offsetLeft + element!.offsetWidth / 2
// 			if (i > 0) epicDividers.push(avg(epicDividers.at(-1)!, epicPos))
// 			epicDividers.push(epicPos)
// 		})

// 		let featureDividers: FeatureDivider[] = []
// 		storyMapState.forEach(({featuresOrder}) => {
// 			featuresOrder.forEach(({feature}, i) => {
// 				const element = elements[feature]!
// 				const featurePos = element!.offsetLeft + element!.offsetWidth / 2
// 				if (i === 0) {
// 					featureDividers.push({pos: featurePos, border: false})
// 				} else {
// 					featureDividers.push({
// 						pos: avg(featureDividers.at(-1)!.pos, featurePos),
// 						border: i === 0,
// 					})
// 					featureDividers.push({pos: featurePos, border: false})
// 				}
// 			})
// 		})

// 		const aFeatures: Array<{feature: Id; storiesOrder: Array<{story: Id}>}> = []
// 		storyMapState.forEach(({featuresOrder}) => {
// 			aFeatures.push(...featuresOrder)
// 		})

// 		let storyDividers: StoryDivider[] = aFeatures.map(({feature, storiesOrder}) => {
// 			const element = elements[feature]!
// 			const dividers: number[] = []
// 			storiesOrder.forEach(({story}, i) => {
// 				const element = elements[story]!
// 				const storyPos = element!.offsetTop + element!.offsetHeight / 2
// 				if (i > 0) dividers.push(avg(dividers.at(-1)!, storyPos))
// 				dividers.push(storyPos)
// 			})

// 			return {
// 				featureId: feature,
// 				featureLeft: element!.offsetLeft,
// 				featureRight: element!.offsetLeft + element!.offsetWidth,
// 				dividers,
// 			}
// 		})

// 		setDividers([epicDividers, featureDividers, storyDividers])
// 		console.log(`removing ${reasons}`)
// 		setPendingDomChanges((prev) => prev.filter(({id}) => reasons?.includes(id)))
// 	}
// }

// // A combination of epics containing stories with the current version and epics containing no stories
// export const epicsByCurrentVersion = (
// 	allEpics: Epic[],
// 	allStories: Story[],
// 	currentVersion: Id | `__ALL_VERSIONS__`,
// ): Epic[] => {
// 	if (currentVersion === `__ALL_VERSIONS__`) return allEpics

// 	const storiesWithCurrentVersion = allStories.filter((story) => story.version === currentVersion)
// 	const epicsWithCurrentVersion = storiesWithCurrentVersion.map((story) => story.epic)

// 	const epicsWithStories = allStories.map((story) => story.epic)
// 	const epicsWithoutStories = allEpics.filter((epic) => !epicsWithStories.includes(epic.id))

// 	const epicsToShow = [...new Set([...epicsWithCurrentVersion, ...epicsWithoutStories])]

// 	// To ensure that the epics are in the same order as in the state.epics array
// 	const epics = allEpics.filter((epic) => epicsToShow.includes(epic.id))
// 	return epics
// }

// // A combination of features containing stories with the current version and features containing no stories
// export const featuresByCurrentVersion = (
// 	allFeatures: Feature[],
// 	allStories: Story[],
// 	currentVersion: Id | `__ALL_VERSIONS__`,
// ): Feature[] => {
// 	if (currentVersion === `__ALL_VERSIONS__`) return allFeatures

// 	const storiesWithCurrentVersion = allStories.filter((story) => story.version === currentVersion)
// 	const featuresWithCurrentVersion = storiesWithCurrentVersion.map((story) => story.feature)

// 	const featuresWithStories = allStories.map((story) => story.feature)
// 	const featuresWithoutStories = allFeatures.filter((feature) => !featuresWithStories.includes(feature.id))

// 	const featuresToShow = [...new Set([...featuresWithCurrentVersion, ...featuresWithoutStories])]

// 	// To ensure that the features are in the same order as in the state.features array
// 	const features = allFeatures.filter((feature) => featuresToShow.includes(feature.id))
// 	return features
// }

// export const storiesByCurrentVersion = (allStories: Story[], currentVersion: Id | `__ALL_VERSIONS__`): Story[] => {
// 	if (currentVersion === `__ALL_VERSIONS__`) return allStories
// 	return allStories.filter((story) => story.version === currentVersion)
// }
