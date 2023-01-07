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

export const addVersion =
	(productId: Id) =>
	async (versionName: string): Promise<void> => {
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

type AddEpicInput = {
	name: string
	description: string
}

export const addEpic =
	(productId: Id) =>
	async ({name, description}: AddEpicInput): Promise<void> => {
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

export const updateEpic =
	(epicId: Id) =>
	async (data: Partial<Pick<Epic, `description` | `name` | `keepers`>>): Promise<void> =>
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

export const addCommentToEpic =
	(epicId: Id) =>
	async (comment: Pick<Comment, `author` | `text` | `type`>): Promise<void> => {
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

export const addFeature =
	(epicId: Id) =>
	async (name: string): Promise<void> => {
		const epic = await getEpic(epicId)()

		const data: Omit<Feature, `id`> = {
			description: ``,
			name,
			priority_level: 0,
			visibility_level: 0,
			comments: [],
			epic: epicId,
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

export const deleteFeature = (featureId: Id) => async (): Promise<void> => {
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

export const updateFeature =
	(featureId: Id) =>
	async (data: Partial<Pick<Feature, `description` | `name` | `comments`>>): Promise<void> =>
		await updateDoc(doc(db, Features._, featureId), data)

export const addCommentToFeature =
	(featureId: Id) =>
	async (comment: Pick<Comment, `author` | `text` | `type`>): Promise<void> => {
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

type AddStoryInput = {
	description: string
	name: string
	version: Id
}

export const addStory =
	(productId: Id, epicId: Id, featureId: Id) =>
	async ({description, name, version}: AddStoryInput): Promise<void> => {
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
			epic: epicId,
			feature: featureId,
			product: productId,
			version,
		}
		const newStoryDoc = await addDoc(collection(db, Stories._), data)

		const product = await getProduct(productId)()
		const storyMapState = produce(product.storyMapState, (draft) => {
			const feature = draft.find((feature) => feature.epic === epicId)!
			const featureOrder = feature.featuresOrder.find((feature) => feature.feature === featureId)!
			featureOrder.storiesOrder.push({story: newStoryDoc.id as Id})
		})
		updateDoc(doc(db, Products._, productId), {storyMapState})
	}

export const deleteStory = (storyId: Id) => async (): Promise<void> => {
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

export const updateStory =
	(storyId: Id) =>
	async (
		data: Partial<
			Pick<Story, `acceptanceCriteria` | `codeLink` | `description` | `designLink` | `name` | `points` | `version`>
		>,
	): Promise<void> =>
		await updateDoc(doc(db, Stories._, storyId), data)

export const addCommentToStory =
	(storyId: Id) =>
	async (comment: Pick<Comment, `author` | `text` | `type`>): Promise<void> => {
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

export const updateInputState =
	(id: Id) =>
	async ({inputState, userId}: {inputState: InputState[`selections`][string]; userId: Id}): Promise<void> => {
		await updateDoc(doc(db, InputStates._, id), {[`${InputStates.selections}.${userId}`]: inputState})
	}
