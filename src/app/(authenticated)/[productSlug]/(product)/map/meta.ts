import type {QuerySnapshot} from "firebase/firestore"
import type {Dispatch, SetStateAction} from "react"
import type {StoryMapItem} from "~/types/db/Products/StoryMapItems"
import type {Version} from "~/types/db/Products/Versions"
import type {AllVersions} from "~/utils/storyMap"

import {getEpics, getFeatures, getStories, sortEpics, sortFeatures, sortStories} from "~/utils/storyMap"

export type UseGenMetaVars = {
	storyMapItems: QuerySnapshot<StoryMapItem>
	allVersions: QuerySnapshot<Version>
	currentVersionId: string | typeof AllVersions
	editMode: boolean
	itemsToBeDeleted: string[]
	setItemsToBeDeleted: Dispatch<SetStateAction<string[]>>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useGenMeta = ({
	storyMapItems,
	allVersions,
	currentVersionId,
	editMode,
	itemsToBeDeleted,
	setItemsToBeDeleted,
}: UseGenMetaVars) => {
	const epics = sortEpics(getEpics(storyMapItems).filter((epic) => !itemsToBeDeleted.includes(epic.id)))
	const features = sortFeatures(getFeatures(storyMapItems).filter((feature) => !itemsToBeDeleted.includes(feature.id)))
	const stories = sortStories(
		getStories(storyMapItems).filter((story) => !itemsToBeDeleted.includes(story.id)),
		allVersions,
	)

	const epicsInfo = epics.map((epic) => ({
		id: epic.id,
		childrenIds: features.filter((feature) => feature.data().parentId === epic.id).map((feature) => feature.id),
		position: epics.findIndex((sibling) => sibling.id === epic.id),
	}))
	const featuresInfo = features.map((feature) => {
		const siblings = features.filter((sibling) => sibling.data().parentId === feature.data().parentId)
		const position = siblings.findIndex((sibling) => sibling.id === feature.id)

		return {
			id: feature.id,
			childrenIds: stories.filter((story) => story.data().parentId === feature.id).map((story) => story.id),
			position,
		}
	})
	const storiesInfo = stories.map((story) => {
		const siblings = sortStories(
			stories.filter((sibling) => sibling.data().parentId === story.data().parentId),
			allVersions,
		)
		const position = siblings.findIndex((sibling) => sibling.id === story.id)

		return {
			id: story.id,
			position,
		}
	})

	return {
		storyMapItems,
		currentVersionId,
		allVersions,
		editMode,
		markForDeletion: (id: string) => {
			setItemsToBeDeleted((prev) => [...prev, id])
		},

		epics,
		epicsInfo,
		features,
		featuresInfo,
		stories,
		storiesInfo,
	}
}

export type StoryMapMeta = ReturnType<typeof useGenMeta>
