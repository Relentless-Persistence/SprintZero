import {
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	serverTimestamp,
	updateDoc,
	where,
	writeBatch,
} from "firebase9/firestore"
import produce from "immer"

import type {Timestamp} from "firebase9/firestore"
import type {Id} from "~/types"
import type {Comment} from "~/types/db/Comments"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {InputState} from "~/types/db/InputStates"
import type {Product} from "~/types/db/Products"
import type {Story} from "~/types/db/Stories"
import type {Version} from "~/types/db/Versions"

import {getEpic, getFeature, getFeaturesByEpic, getProduct, getStoriesByEpic, getStoriesByFeature} from "./queries"
import {db} from "~/config/firebase"
import {Comments} from "~/types/db/Comments"
import {EpicSchema, Epics} from "~/types/db/Epics"
import {FeatureSchema, Features} from "~/types/db/Features"
import {InputStates} from "~/types/db/InputStates"
import {Products} from "~/types/db/Products"
import {StorySchema, Stories} from "~/types/db/Stories"
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

type AddEpicVars = {
	productId: Id
	name: string
	description: string
}

export const addEpic = async ({productId, name, description}: AddEpicVars): Promise<void> => {
	const inputState = await createInputState()

	const data: Omit<Epic, `id` | `updatedAt`> = {
		description,
		name,
		priority_level: 0,
		visibility_level: 0,
		comments: [],
		keepers: [],
		nameInputState: inputState,
		product: productId,
	}
	const newEpicDoc = await addDoc(collection(db, Epics._), data)

	const product = await getProduct(productId)()
	let storyMapState = product.storyMapState
	storyMapState.push({epic: newEpicDoc.id as Id, featuresOrder: []})
	updateDoc(doc(db, Products._, productId), {storyMapState})
}

type UpdateEpicVars = {
	epicId: Id
	data: Partial<Pick<Epic, `description` | `name` | `keepers`>>
}

export const updateEpic = async ({epicId, data}: UpdateEpicVars): Promise<void> =>
	await updateDoc(doc(db, Epics._, epicId), data)

export const deleteEpic = (epicId: Id) => async (): Promise<void> => {
	const epicDoc = await getDoc(doc(db, Epics._, epicId))
	const epic = EpicSchema.parse({id: epicDoc.id, ...epicDoc.data()})

	const [features, stories, product] = await Promise.all([
		getFeaturesByEpic(epicId)(),
		getStoriesByEpic(epicId)(),
		getProduct(epic.product)(),
	])

	const batch = writeBatch(db)
	batch.update(doc(db, Products._, product.id), {
		storyMapState: product.storyMapState.filter((s) => s.epic !== epicId),
	} satisfies Partial<Product>)
	stories.forEach((story) => void batch.delete(doc(db, Stories._, story.id)))
	features.forEach((feature) => void batch.delete(doc(db, Features._, feature.id)))
	batch.delete(doc(db, Epics._, epicId))
	await batch.commit()
}

type MoveEpicToVars = {
	productId: Id
	epicId: Id
	position: number
}

export const moveEpicTo = async ({productId, epicId, position}: MoveEpicToVars): Promise<void> => {
	const storyMapState = [...(await getProduct(productId)()).storyMapState]
	const epicIndex = storyMapState.findIndex((s) => s.epic === epicId)
	if (epicIndex === position) return

	const epicState = storyMapState[epicIndex]!
	storyMapState[epicIndex] = storyMapState[position]!
	storyMapState[position] = epicState

	await updateDoc(doc(db, Products._, productId), {storyMapState} satisfies Partial<Product>)
}

type AddCommentToEpicVars = {
	epicId: Id
	comment: Pick<Comment, `author` | `text` | `type`>
}

export const addCommentToEpic = async ({epicId, comment}: AddCommentToEpicVars): Promise<void> => {
	const epicDoc = await getDoc(doc(db, Epics._, epicId))
	const epic = EpicSchema.parse({id: epicDoc.id, ...epicDoc.data()})

	const commentData: Omit<Comment, `id`> = {
		...comment,
		createdAt: serverTimestamp() as Timestamp,
	}
	const commentDoc = await addDoc(collection(db, Comments._), commentData)
	await updateDoc(doc(db, Epics._, epicId), {
		comments: [...epic.comments, commentDoc.id as Id],
	} satisfies Partial<Epic>)
}

type AddFeatureVars = {
	epicId: Id
	name: string
}

export const addFeature = async ({epicId, name}: AddFeatureVars): Promise<void> => {
	const epic = await getEpic(epicId)()

	const data: Omit<Feature, `id`> = {
		description: ``,
		name,
		priority_level: 0,
		visibility_level: 0,
		comments: [],
		epic: epicId,
		nameInputState: await createInputState(),
		product: epic.product,
	}
	const newFeatureDoc = await addDoc(collection(db, Features._), data)

	const product = await getProduct(epic.product)()
	const storyMapState = produce(product.storyMapState, (draft) => {
		draft
			.find((feature) => feature.epic === epicId)!
			.featuresOrder.push({feature: newFeatureDoc.id as Id, storiesOrder: []})
	})
	updateDoc(doc(db, Products._, epic.product), {storyMapState})
}

type DeleteFeatureVars = {
	featureId: Id
}

export const deleteFeature = async ({featureId}: DeleteFeatureVars): Promise<void> => {
	const feature = await getFeature(featureId)()

	const [epic, stories, product] = await Promise.all([
		getEpic(feature.epic)(),
		getStoriesByFeature(featureId)(),
		getProduct(feature.product)(),
	])

	const batch = writeBatch(db)
	const storyMapState = produce(product.storyMapState, (draft) => {
		const feature = draft.find((feature) => feature.epic === epic.id)!
		feature.featuresOrder = feature.featuresOrder.filter((feature) => feature.feature !== featureId)
	})
	batch.update(doc(db, Products._, product.id), {storyMapState})
	stories.forEach((story) => void batch.delete(doc(db, Stories._, story.id)))
	batch.delete(doc(db, Features._, featureId))
	await batch.commit()
}

type UpdateFeatureVars = {
	featureId: Id
	data: Partial<Pick<Feature, `description` | `name` | `comments`>>
}

export const updateFeature = async ({featureId, data}: UpdateFeatureVars): Promise<void> =>
	await updateDoc(doc(db, Features._, featureId), data)

type AddCommentToFeatureVars = {
	featureId: Id
	comment: Pick<Comment, `author` | `text` | `type`>
}

export const addCommentToFeature = async ({featureId, comment}: AddCommentToFeatureVars): Promise<void> => {
	const featureDoc = await getDoc(doc(db, Features._, featureId))
	const feature = FeatureSchema.parse({id: featureDoc.id, ...featureDoc.data()})
	const commentData: Omit<Comment, `id`> = {
		...comment,
		createdAt: serverTimestamp() as Timestamp,
	}
	const commentDoc = await addDoc(collection(db, Comments._), commentData)
	await updateDoc(doc(db, Features._, featureId), {
		comments: [...feature.comments, commentDoc.id as Id],
	} satisfies Partial<Feature>)
}

type AddStoryVars = {
	featureId: Id
	description: string
	name: string
	version: Id
}

export const addStory = async ({featureId, description, name, version}: AddStoryVars): Promise<void> => {
	const feature = await getFeature(featureId)()

	const data: Omit<Story, `id`> = {
		acceptanceCriteria: [],
		codeLink: null,
		description,
		designLink: null,
		name,
		points: 0,
		priority_level: 0,
		visibility_level: 0,
		comments: [],
		epic: feature.epic,
		feature: featureId,
		nameInputState: await createInputState(),
		product: feature.product,
		version,
	}
	const newStoryDoc = await addDoc(collection(db, Stories._), data)

	const product = await getProduct(feature.product)()
	const storyMapState = produce(product.storyMapState, (storyMapState) => {
		storyMapState
			.find((e) => e.epic === feature.epic)!
			.featuresOrder.find((f) => f.feature === featureId)!
			.storiesOrder.push({story: newStoryDoc.id as Id})
	})
	updateDoc(doc(db, Products._, feature.product), {storyMapState})
}

type DeleteStoryVars = {
	storyId: Id
}

export const deleteStory = async ({storyId}: DeleteStoryVars): Promise<void> => {
	const storyDoc = await getDoc(doc(db, Stories._, storyId))
	const story = StorySchema.parse({id: storyDoc.id, ...storyDoc.data()})

	const product = await getProduct(story.product)()

	const batch = writeBatch(db)
	const storyMapState = produce(product.storyMapState, (draft) => {
		const featuresOrder = draft.find((feature) => feature.epic === story.epic)!.featuresOrder
		let storiesOrder = featuresOrder.find((feature) => feature.feature === story.feature)!.storiesOrder
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		storiesOrder = storiesOrder.filter((story) => story.story !== storyId)
	})
	batch.update(doc(db, Products._, product.id), {storyMapState})
	batch.delete(doc(db, Stories._, storyId))
	await batch.commit()
}

type UpdateStoryVars = {
	storyId: Id
	data: Partial<
		Pick<Story, `acceptanceCriteria` | `codeLink` | `description` | `designLink` | `name` | `points` | `version`>
	>
}

export const updateStory = async ({storyId, data}: UpdateStoryVars): Promise<void> =>
	await updateDoc(doc(db, Stories._, storyId), data)

type AddCommentToStoryVars = {
	storyId: Id
	comment: Pick<Comment, `author` | `text` | `type`>
}

export const addCommentToStory = async ({storyId, comment}: AddCommentToStoryVars): Promise<void> => {
	const storyDoc = await getDoc(doc(db, Stories._, storyId))
	const story = StorySchema.parse({id: storyDoc.id, ...storyDoc.data()})
	const commentData: Omit<Comment, `id`> = {
		...comment,
		createdAt: serverTimestamp() as Timestamp,
	}
	const commentDoc = await addDoc(collection(db, Comments._), commentData)
	await updateDoc(doc(db, Stories._, storyId), {
		comments: [...story.comments, commentDoc.id as Id],
	} satisfies Partial<Story>)
}

export const createInputState = async (): Promise<Id> => {
	return (
		await addDoc(collection(db, InputStates._), {
			selections: {},
		} satisfies Omit<InputState, `id`>)
	).id as Id
}

type UpdateInputStateVars = {
	id: Id
	inputState: InputState[`selections`][string]
	userId: Id
}

export const updateInputState = async ({id, inputState, userId}: UpdateInputStateVars): Promise<void> => {
	await updateDoc(doc(db, InputStates._, id), {[`${InputStates.selections}.${userId}`]: inputState})
}
