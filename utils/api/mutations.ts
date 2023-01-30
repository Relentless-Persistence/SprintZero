import {addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where} from "firebase9/firestore"
import produce from "immer"
import {nanoid} from "nanoid"

import type {SetRequired} from "type-fest"
import type {Id} from "~/types"
import type {AccessibilityItem} from "~/types/db/AccessibilityItems"
import type {Comment} from "~/types/db/Comments"
import type {InputState} from "~/types/db/InputStates"
import type {Epic, Feature, Product, Story, StoryMapState} from "~/types/db/Products"
import type {Version} from "~/types/db/Versions"

import {storyMapMeta} from "~/app/[productSlug]/dashboard/storyMap/utils/globals"
import {db} from "~/config/firebase"
import {AccessibilityItems} from "~/types/db/AccessibilityItems"
import {Comments} from "~/types/db/Comments"
import {InputStates} from "~/types/db/InputStates"
import {ProductSchema, Products} from "~/types/db/Products"
import {Versions} from "~/types/db/Versions"

type AddVersionVars = {
	productId: Id
	versionName: string
}

export const addVersion = async ({productId, versionName}: AddVersionVars): Promise<void> => {
	const existingDoc = (
		await getDocs(
			query(
				collection(db, Versions._),
				where(Versions.product, `==`, productId),
				where(Versions.name, `==`, versionName),
			),
		)
	).docs[0]
	if (existingDoc) throw new Error(`Version already exists.`)

	const data: Omit<Version, `id`> = {
		name: versionName,
		product: productId,
	}
	await addDoc(collection(db, Versions._), data)
}

type UpdateProductVars = {
	id: Id
	data: Partial<Product>
}

export const updateProduct = async ({id, data}: UpdateProductVars): Promise<void> => {
	const validData = ProductSchema.parse(data)
	await updateDoc(doc(db, Products._, id), validData)
}

type AddEpicVars = {
	storyMapState: StoryMapState
	data: Partial<Epic>
	position?: number
}

export const addEpic = async ({storyMapState, data: initialData, position}: AddEpicVars): Promise<void> => {
	const prevEpicUserValue =
		position === undefined
			? storyMapState.epics[storyMapState.epics.length - 1]?.userValue ?? 0
			: storyMapState.epics[position - 1]!.userValue
	const nextEpicUserValue = position === undefined ? 1 : storyMapState.epics[position]!.userValue

	const id = nanoid() as Id
	const data: Epic = {
		id,
		description: ``,
		effort: 0.5,
		name: `Epic ${storyMapState.epics.length + 1}`,
		userValue: (prevEpicUserValue + nextEpicUserValue) / 2,
		commentIds: [],
		featureIds: [],
		keeperIds: [],
		nameInputStateId: await createInputState(),
		...initialData,
	}

	const newStoryMapState = produce(storyMapState, (state) => {
		state.epics.splice(position ?? Infinity, 0, data)
	})

	await updateDoc(doc(db, Products._, storyMapState.productId), {
		storyMapState: newStoryMapState,
	} satisfies Partial<Product>)
}

type UpdateEpicVars = {
	storyMapState: StoryMapState
	epicId: Id
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
	await updateDoc(doc(db, Products._, storyMapState.productId), {
		storyMapState: newStoryMapState,
	} satisfies Partial<Product>)
}

type DeleteEpicVars = {
	storyMapState: StoryMapState
	epicId: Id
}

export const deleteEpic = async ({storyMapState, epicId}: DeleteEpicVars): Promise<void> => {
	const newStoryMapState = produce(storyMapState, (state) => {
		state.epics = state.epics.filter(({id}) => id !== epicId)
	})

	updateDoc(doc(db, Products._, storyMapState.productId), {storyMapState: newStoryMapState} satisfies Partial<Product>)
}

type AddFeatureVars = {
	storyMapState: StoryMapState
	epicId: Id
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

	const id = nanoid() as Id
	const data: Feature = {
		id,
		description: ``,
		effort: 0.5,
		name: `Feature ${storyMapState.features.length + 1}`,
		userValue: (prevFeatureUserValue + nextFeatureUserValue) / 2,
		commentIds: [],
		nameInputStateId: await createInputState(),
		storyIds: [],
		...initialData,
	}

	const newStoryMapState = produce(storyMapState, (state) => {
		state.features.push(data)
		const epic = state.epics.find(({id}) => id === epicId)!
		epic.featureIds.splice(position ?? Infinity, 0, id)
	})
	await updateDoc(doc(db, Products._, storyMapState.productId), {
		storyMapState: newStoryMapState,
	} satisfies Partial<Product>)
}

type DeleteFeatureVars = {
	storyMapState: StoryMapState
	featureId: Id
}

export const deleteFeature = async ({storyMapState, featureId}: DeleteFeatureVars): Promise<void> => {
	const featureMeta = storyMapMeta.current[featureId]!
	const newStoryMapState = produce(storyMapState, (state) => {
		const epic = state.epics.find(({id}) => id === featureMeta.parent)!
		epic.featureIds = epic.featureIds.filter((id) => id !== featureId)
		state.features.filter(({id}) => id !== featureId)
	})
	updateDoc(doc(db, Products._, storyMapState.productId), {storyMapState: newStoryMapState} satisfies Partial<Product>)
}

type UpdateFeatureVars = {
	storyMapState: StoryMapState
	featureId: Id
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
	await updateDoc(doc(db, Products._, storyMapState.productId), {
		storyMapState: newStoryMapState,
	} satisfies Partial<Product>)
}

type AddStoryVars = {
	storyMapState: StoryMapState
	featureId: Id
	data: SetRequired<Partial<Story>, `versionId`>
	position?: number
}

export const addStory = async ({
	storyMapState,
	featureId,
	data: initialData,
	position,
}: AddStoryVars): Promise<void> => {
	const id = nanoid() as Id
	const data: Story = {
		id,
		acceptanceCriteria: [],
		branchName: null,
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
		nameInputStateId: await createInputState(),
		...initialData,
	}

	const newStoryMapState = produce(storyMapState, (state) => {
		state.stories.push(data)
		const feature = state.features.find(({id}) => id === featureId)!
		feature.storyIds.splice(position ?? Infinity, 0, id)
	})
	await updateDoc(doc(db, Products._, storyMapState.productId), {
		storyMapState: newStoryMapState,
	} satisfies Partial<Product>)
}

type DeleteStoryVars = {
	storyMapState: StoryMapState
	storyId: Id
}

export const deleteStory = async ({storyMapState, storyId}: DeleteStoryVars): Promise<void> => {
	const storyMeta = storyMapMeta.current[storyId]!
	const newStoryMapState = produce(storyMapState, (state) => {
		const feature = state.features.find(({id}) => id === storyMeta.parent)!
		feature.storyIds = feature.storyIds.filter((id) => id !== storyId)
		state.stories = state.stories.filter(({id}) => id !== storyId)
	})
	await updateDoc(doc(db, Products._, storyMapState.productId), {
		storyMapState: newStoryMapState,
	} satisfies Partial<Product>)
}

type UpdateStoryVars = {
	storyMapState: StoryMapState
	storyId: Id
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
	await updateDoc(doc(db, Products._, storyMapState.productId), {
		storyMapState: newStoryMapState,
	} satisfies Partial<Product>)
}

export const createInputState = async (): Promise<Id> =>
	(
		await addDoc(collection(db, InputStates._), {
			selections: {},
		} satisfies Omit<InputState, `id`>)
	).id as Id

type UpdateInputStateVars = {
	id: Id
	inputState: InputState[`selections`][string]
	userId: Id
}

export const updateInputState = async ({id, inputState, userId}: UpdateInputStateVars): Promise<void> => {
	await updateDoc(doc(db, InputStates._, id), {[`${InputStates.selections}.${userId}`]: inputState})
}

type SetStoryMapStateVars = {
	storyMapState: StoryMapState
}

export const setStoryMapState = async ({storyMapState}: SetStoryMapStateVars): Promise<void> =>
	await updateDoc(doc(db, Products._, storyMapState.productId), {storyMapState})

type AddCommentVars = {
	comment: Omit<Comment, `id`>
}

export const addComment = async ({comment}: AddCommentVars): Promise<Id> => {
	const ref = await addDoc(collection(db, Comments._), comment)
	return ref.id as Id
}

type AddAccessibilityItemVars = {
	item: Omit<AccessibilityItem, `id`>
}

export const addAccessibilityItem = async ({item}: AddAccessibilityItemVars): Promise<Id> => {
	const ref = await addDoc(collection(db, AccessibilityItems._), item)
	return ref.id as Id
}

type UpdateAccessibilityItemVars = {
	id: Id
	data: Partial<Omit<AccessibilityItem, `id`>>
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
