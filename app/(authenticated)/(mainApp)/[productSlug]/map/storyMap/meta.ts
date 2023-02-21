import type {QueryDocumentSnapshot, QuerySnapshot} from "firebase/firestore"
import type {Dispatch, SetStateAction} from "react"
import type {Id} from "~/types"
import type {StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {getEpics, getFeatures, getStories, sortEpics, sortFeatures, sortStories} from "~/utils/storyMap"

export type UseGenMetaVars = {
	storyMapState: QueryDocumentSnapshot<StoryMapState>
	allVersions: QuerySnapshot<Version>
	currentVersionId: Id | `__ALL_VERSIONS__`
	editMode: boolean
	itemsToBeDeleted: Id[]
	setItemsToBeDeleted: Dispatch<SetStateAction<Id[]>>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useGenMeta = ({
	storyMapState,
	allVersions,
	currentVersionId,
	editMode,
	itemsToBeDeleted,
	setItemsToBeDeleted,
}: UseGenMetaVars) => {
	const epics = getEpics(storyMapState.data().items)
	const features = getFeatures(storyMapState.data().items)
	const stories = getStories(storyMapState.data().items)

	const storiesWithExtra = stories
		.filter((story) => !itemsToBeDeleted.includes(story.id))
		.map((story) => {
			const siblings = sortStories(
				stories.filter((sibling) => sibling.parentId === story.parentId),
				allVersions,
			)
			const position = siblings.findIndex((sibling) => sibling.id === story.id)

			return {...story, position}
		})
	const featuresWithExtra = features
		.filter((feature) => !itemsToBeDeleted.includes(feature.id))
		.map((feature) => {
			const siblings = sortFeatures(features.filter((sibling) => sibling.parentId === feature.parentId))
			const position = siblings.findIndex((sibling) => sibling.id === feature.id)

			return {
				...feature,
				childrenIds: sortStories(
					storiesWithExtra.filter((story) => story.parentId === feature.id),
					allVersions,
				).map((story) => story.id),
				position,
			}
		})
	const epicsWithExtra = sortEpics(epics)
		.filter((epic) => !itemsToBeDeleted.includes(epic.id))
		.map((epic) => ({
			...epic,
			childrenIds: sortFeatures(featuresWithExtra.filter((feature) => feature.parentId === epic.id)).map(
				(feature) => feature.id,
			),
			position: epics.findIndex((sibling) => sibling.id === epic.id),
		}))

	return {
		storyMapState,
		currentVersionId,
		allVersions,
		editMode,
		markForDeletion: (id: Id) => {
			setItemsToBeDeleted((prev) => [...prev, id])
		},

		epics: epicsWithExtra,
		features: featuresWithExtra,
		stories: storiesWithExtra,
	}
}

export type StoryMapMeta = ReturnType<typeof useGenMeta>
