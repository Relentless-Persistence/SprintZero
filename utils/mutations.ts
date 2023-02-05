import {addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"

import type {SetRequired} from "type-fest"
import type {Id, WithDocumentData} from "~/types"
import type {AccessibilityItem} from "~/types/db/AccessibilityItems"
import type {Comment} from "~/types/db/Comments"
import type {Objective} from "~/types/db/Objectives"
import type {Product} from "~/types/db/Products"
import type {Epic, Feature, Story, StoryMapState} from "~/types/db/StoryMapStates"
import type {Version} from "~/types/db/Versions"

import {storyMapMeta} from "~/app/(authenticated)/(mainApp)/[productSlug]/map/storyMap/utils/globals"
import {AccessibilityItems} from "~/types/db/AccessibilityItems"
import {Comments} from "~/types/db/Comments"
import {Objectives, ObjectiveSchema} from "~/types/db/Objectives"
import {ProductSchema, Products} from "~/types/db/Products"
import {StoryMapStateSchema, StoryMapStates} from "~/types/db/StoryMapStates"
import {Versions} from "~/types/db/Versions"
import {db} from "~/utils/firebase"

type AddVersionVars = {
	storyMapStateId: Id
	versionName: string
}

export const addVersion = async ({storyMapStateId, versionName}: AddVersionVars): Promise<void> => {
	const existingDoc = (
		await getDocs(
			query(collection(db, StoryMapStates._, storyMapStateId, Versions._), where(Versions.name, `==`, versionName)),
		)
	).docs[0]
	if (existingDoc) throw new Error(`Version already exists.`)

	const data: Version = {
		name: versionName,
	}
	await addDoc(collection(db, StoryMapStates._, storyMapStateId, Versions._), data)
}

type UpdateProductVars = {
	id: Id
	data: Partial<Product>
}

export const updateProduct = async ({id, data}: UpdateProductVars): Promise<void> => {
	const validData = ProductSchema.partial().parse(data)
	await updateDoc(doc(db, Products._, id), validData)
}

type AddEpicVars = {
	storyMapState: WithDocumentData<StoryMapState>
	data: Partial<Epic>
	position?: number
}

export const addEpic = async ({storyMapState, data: initialData, position}: AddEpicVars): Promise<void> => {
	const prevEpicUserValue =
		position === undefined
			? storyMapState.epics[storyMapState.epics.length - 1]?.userValue ?? 0
			: storyMapState.epics[position - 1]!.userValue
	const nextEpicUserValue = position === undefined ? 1 : storyMapState.epics[position]!.userValue

	const id = nanoid()
	const data: Epic = {
		id,
		description: ``,
		effort: 0.5,
		name: `Epic ${storyMapState.epics.length + 1}`,
		userValue: (prevEpicUserValue + nextEpicUserValue) / 2,
		commentIds: [],
		featureIds: [],
		keeperIds: [],
		...initialData,
	}

	const newStoryMapState = produce(storyMapState, (state) => {
		state.epics.splice(position ?? Infinity, 0, data)
	})

	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type UpdateEpicVars = {
	storyMapState: WithDocumentData<StoryMapState>
	epicId: string
	data: Partial<Pick<Epic, `description` | `name` | `commentIds` | `keeperIds`>>
}

export const updateEpic = async ({storyMapState, epicId, data}: UpdateEpicVars): Promise<void> => {
	const newStoryMapState = produce(storyMapState, (state) => {
		const epicIndex = state.epics.findIndex(({id}) => id === epicId)
		state.epics[epicIndex] = {
			...state.epics[epicIndex]!,
			...data,
		}
	})
	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type DeleteEpicVars = {
	storyMapState: WithDocumentData<StoryMapState>
	epicId: string
}

export const deleteEpic = async ({storyMapState, epicId}: DeleteEpicVars): Promise<void> => {
	const newStoryMapState = produce(storyMapState, (state) => {
		state.epics = state.epics.filter(({id}) => id !== epicId)
	})

	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type AddFeatureVars = {
	storyMapState: WithDocumentData<StoryMapState>
	epicId: string
	data: Partial<Feature>
	position?: number
}

export const addFeature = async ({
	storyMapState,
	epicId,
	data: initialData,
	position,
}: AddFeatureVars): Promise<void> => {
	const featureList = storyMapState.epics.find(({id}) => id === epicId)!.featureIds
	const prevFeatureUserValue =
		position === undefined
			? storyMapState.features.find((feature) => feature.id === featureList.at(-1))?.userValue ?? 0
			: storyMapState.features.find((feature) => feature.id === featureList[position - 1])!.userValue
	const nextFeatureUserValue =
		position === undefined
			? 1
			: storyMapState.features.find((feature) => feature.id === featureList[position])!.userValue

	const id = nanoid()
	const data: Feature = {
		id,
		description: ``,
		effort: 0.5,
		name: `Feature ${storyMapState.features.length + 1}`,
		userValue: (prevFeatureUserValue + nextFeatureUserValue) / 2,
		commentIds: [],
		storyIds: [],
		...initialData,
	}

	const newStoryMapState = produce(storyMapState, (state) => {
		state.features.push(data)
		const epic = state.epics.find(({id}) => id === epicId)!
		epic.featureIds.splice(position ?? Infinity, 0, id)
	})
	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type DeleteFeatureVars = {
	storyMapState: WithDocumentData<StoryMapState>
	featureId: string
}

export const deleteFeature = async ({storyMapState, featureId}: DeleteFeatureVars): Promise<void> => {
	const featureMeta = storyMapMeta.current[featureId]!
	const newStoryMapState = produce(storyMapState, (state) => {
		const epic = state.epics.find(({id}) => id === featureMeta.parent)!
		epic.featureIds = epic.featureIds.filter((id) => id !== featureId)
		state.features.filter(({id}) => id !== featureId)
	})
	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type UpdateFeatureVars = {
	storyMapState: WithDocumentData<StoryMapState>
	featureId: string
	data: Partial<Pick<Feature, `description` | `name` | `commentIds`>>
}

export const updateFeature = async ({storyMapState, featureId, data}: UpdateFeatureVars): Promise<void> => {
	const newStoryMapState = produce(storyMapState, (state) => {
		const featureIndex = state.features.findIndex(({id}) => id === featureId)
		state.features[featureIndex] = {
			...state.features[featureIndex]!,
			...data,
		}
	})
	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type AddStoryVars = {
	storyMapState: WithDocumentData<StoryMapState>
	featureId: string
	data: SetRequired<Partial<Story>, `versionId`>
	position?: number
}

export const addStory = async ({
	storyMapState,
	featureId,
	data: initialData,
	position,
}: AddStoryVars): Promise<void> => {
	const id = nanoid()
	const data: Story = {
		id,
		acceptanceCriteria: [],
		branchName: null,
		createdAt: Timestamp.now(),
		description: ``,
		designLink: null,
		ethicsApproved: null,
		ethicsColumn: null,
		ethicsVotes: [],
		name: `Story ${storyMapState.stories.length + 1}`,
		pageLink: null,
		points: 0,
		sprintColumn: `productBacklog`,
		commentIds: [],
		...initialData,
	}

	const newStoryMapState = produce(storyMapState, (draft) => {
		draft.stories.push(data)
		const feature = draft.features.find(({id}) => id === featureId)!
		feature.storyIds.splice(position ?? Infinity, 0, id)
	})
	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type DeleteStoryVars = {
	storyMapState: WithDocumentData<StoryMapState>
	storyId: string
}

export const deleteStory = async ({storyMapState, storyId}: DeleteStoryVars): Promise<void> => {
	const storyMeta = storyMapMeta.current[storyId]!
	const newStoryMapState = produce(storyMapState, (state) => {
		const feature = state.features.find(({id}) => id === storyMeta.parent)!
		feature.storyIds = feature.storyIds.filter((id) => id !== storyId)
		state.stories = state.stories.filter(({id}) => id !== storyId)
	})
	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type UpdateStoryVars = {
	storyMapState: WithDocumentData<StoryMapState>
	storyId: string
	data: Partial<Story>
}

export const updateStory = async ({storyMapState, storyId, data}: UpdateStoryVars): Promise<void> => {
	const newStoryMapState = produce(storyMapState, (state) => {
		const storyIndex = state.stories.findIndex(({id}) => id === storyId)
		state.stories[storyIndex] = {
			...state.stories[storyIndex]!,
			...data,
		}
	})
	await updateDoc(doc(db, StoryMapStates._, storyMapState.id), newStoryMapState)
}

type SetStoryMapStateVars = {
	id: Id
	data: StoryMapState
}

export const setStoryMapState = async ({id, data}: SetStoryMapStateVars): Promise<void> => {
	const safeData = StoryMapStateSchema.parse(data)
	await updateDoc(doc(db, StoryMapStates._, id), safeData)
}

type AddCommentVars = {
	storyMapStateId: Id
	comment: Comment
}

export const addComment = async ({storyMapStateId, comment}: AddCommentVars): Promise<Id> => {
	const ref = await addDoc(collection(db, StoryMapStates._, storyMapStateId, Comments._), comment)
	return ref.id as Id
}

type AddAccessibilityItemVars = {
	item: AccessibilityItem
}

export const addAccessibilityItem = async ({item}: AddAccessibilityItemVars): Promise<Id> => {
	const ref = await addDoc(collection(db, AccessibilityItems._), item)
	return ref.id as Id
}

type UpdateAccessibilityItemVars = {
	id: Id
	data: Partial<AccessibilityItem>
}

export const updateAccessibilityItem = async ({id, data}: UpdateAccessibilityItemVars): Promise<void> => {
	await updateDoc(doc(db, AccessibilityItems._, id), data)
}

type DeleteAccessibilityItemVars = {
	id: Id
}

export const deleteAccessibilityItem = async ({id}: DeleteAccessibilityItemVars): Promise<void> => {
	await deleteDoc(doc(db, AccessibilityItems._, id))
}

type UpdateObjectiveVars = {
	id: Id
	data: Partial<Objective>
}

export const updateObjective = async ({id, data}: UpdateObjectiveVars): Promise<void> => {
	const safeData = ObjectiveSchema.partial().parse(data)
	await updateDoc(doc(db, Objectives._, id), safeData)
}
