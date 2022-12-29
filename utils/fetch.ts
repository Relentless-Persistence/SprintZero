import {
	addDoc,
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where,
	writeBatch,
} from "firebase9/firestore"

import type {Timestamp} from "firebase9/firestore"
import type {Id} from "~/types"
import type {Comment} from "~/types/db/Comments"
import type {Epic} from "~/types/db/Epics"
import type {Feature} from "~/types/db/Features"
import type {Product} from "~/types/db/Products"
import type {Story} from "~/types/db/Stories"
import type {Version} from "~/types/db/Versions"

import {db} from "~/config/firebase"
import {Comments} from "~/types/db/Comments"
import {EpicSchema, Epics, EpicCollectionSchema} from "~/types/db/Epics"
import {FeatureSchema, Features, FeatureCollectionSchema} from "~/types/db/Features"
import {ProductSchema, Products, ProductCollectionSchema} from "~/types/db/Products"
import {StorySchema, Stories, StoryCollectionSchema} from "~/types/db/Stories"
import {Versions, VersionCollectionSchema} from "~/types/db/Versions"

arrayUnion

// export const getUsersById = async (ids: Id[]): Promise<User[]> => {
// 	const userDocs = await getDocs(query(collection(db, Users._), where(Users.id, `in`, ids)))
// 	const users = UserCollectionSchema.parse(userDocs.docs.map((doc) => ({id: doc.id, ...doc.data()})))
// 	return users
// }

export const getProduct = (id: string) => async (): Promise<Product> => {
	const productDoc = await getDoc(doc(db, Products._, id))
	const product = ProductSchema.parse({id: productDoc.id, ...productDoc.data()})
	return product
}

export const getProductBySlug = (slug: string) => async (): Promise<Product> => {
	const productDoc = (await getDocs(query(collection(db, Products._), where(Products.slug, `==`, slug)))).docs[0]
	if (!productDoc) throw new Error(`Product not found.`)
	const product = ProductSchema.parse({id: productDoc.id, ...productDoc.data()})
	return product
}

export const getAllProducts = (userId: string) => async (): Promise<Product[]> => {
	const _data = await getDocs(
		query(collection(db, Products._), where(Products.owner, `==`, userId), orderBy(Products.name)),
	)
	const data = ProductCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getAllVersions = (productId: string) => async (): Promise<Version[]> => {
	const _data = await getDocs(
		query(collection(db, Versions._), where(Versions.product, `==`, productId), orderBy(Versions.name)),
	)
	const data = VersionCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

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
		const lastEpicData = (
			await getDocs(
				query(collection(db, Epics._), where(Epics.next_epic, `==`, null), where(Epics.product, `==`, productId)),
			)
		).docs[0]
		const lastEpic = lastEpicData ? EpicSchema.parse({id: lastEpicData.id, ...lastEpicData.data()}) : null
		const data: Omit<Epic, `id` | `updatedAt`> = {
			description,
			name,
			keepers: [],
			comments: [],
			features: [],
			priority_level: 0,
			visibility_level: 0,
			next_epic: null,
			prev_epic: lastEpic?.id ?? null,
			product: productId,
		}
		const newEpicDoc = await addDoc(collection(db, Epics._), data)
		if (lastEpicData)
			updateDoc(doc(db, Epics._, lastEpicData.id), {next_epic: newEpicDoc.id as Id} satisfies Partial<Epic>)
	}

const getEpic = (epicId: Id) => async (): Promise<Epic> => {
	const epicDoc = await getDoc(doc(db, Epics._, epicId))
	const epic = EpicSchema.parse({id: epicDoc.id, ...epicDoc.data()})
	return epic
}

export const getAllEpics = (productId: Id) => async (): Promise<Epic[]> => {
	const _data = await getDocs(query(collection(db, Epics._), where(Epics.product, `==`, productId)))
	const data = EpicCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const updateEpic =
	(epicId: Id) =>
	async (data: Partial<Pick<Epic, `description` | `name` | `keepers`>>): Promise<void> =>
		await updateDoc(doc(db, Epics._, epicId), data)

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

export const deleteEpic = (epicId: Id) => async (): Promise<void> => {
	const epicDoc = await getDoc(doc(db, Epics._, epicId))
	const epic = EpicSchema.parse({id: epicDoc.id, ...epicDoc.data()})

	const [features, stories] = await Promise.all([getFeaturesByEpic(epicId)(), getStoriesByEpic(epicId)()])

	const batch = writeBatch(db)
	if (epic.prev_epic)
		batch.update(doc(db, Epics._, epic.prev_epic), {next_epic: epic.next_epic} satisfies Partial<Epic>)
	if (epic.next_epic)
		batch.update(doc(db, Epics._, epic.next_epic), {prev_epic: epic.prev_epic} satisfies Partial<Epic>)
	stories.forEach((story) => void batch.delete(doc(db, Stories._, story.id)))
	features.forEach((feature) => void batch.delete(doc(db, Features._, feature.id)))
	batch.delete(doc(db, Epics._, epicId))
	await batch.commit()
}

export const addFeature =
	(productId: Id, epicId: Id) =>
	async (name: string): Promise<void> => {
		const lastFeatureData = (
			await getDocs(
				query(collection(db, Features._), where(Features.epic, `==`, epicId), where(Features.next_feature, `==`, null)),
			)
		).docs[0]
		const lastFeature = lastFeatureData
			? FeatureSchema.parse({id: lastFeatureData.id, ...lastFeatureData.data()})
			: null

		const data: Omit<Feature, `id`> = {
			description: ``,
			name,
			priority_level: 0,
			visibility_level: 0,
			comments: [],
			stories: [],
			epic: epicId,
			prev_feature: lastFeature?.id ?? null,
			next_feature: null,
			product: productId,
		}
		const newFeatureDoc = await addDoc(collection(db, Features._), data)
		if (lastFeatureData)
			updateDoc(doc(db, Features._, lastFeatureData.id), {
				next_feature: newFeatureDoc.id as Id,
			} satisfies Partial<Feature>)
	}

const getFeature = (featureId: Id) => async (): Promise<Feature> => {
	const featureDoc = await getDoc(doc(db, Features._, featureId))
	const feature = FeatureSchema.parse({id: featureDoc.id, ...featureDoc.data()})
	return feature
}

const getFeaturesByEpic = (epicId: Id) => async (): Promise<Feature[]> => {
	const _data = await getDocs(query(collection(db, Features._), where(Features.epic, `==`, epicId)))
	const data = FeatureCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getAllFeatures = (productId: Id) => async (): Promise<Feature[]> => {
	const _data = await getDocs(query(collection(db, Features._), where(Features.product, `==`, productId)))
	const data = FeatureCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
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

export const deleteFeature = (featureId: Id) => async (): Promise<void> => {
	const featureDoc = await getDoc(doc(db, Features._, featureId))
	const feature = FeatureSchema.parse({id: featureDoc.id, ...featureDoc.data()})

	const [epic, stories] = await Promise.all([getEpic(feature.epic)(), getStoriesByFeature(featureId)()])

	const batch = writeBatch(db)
	if (feature.prev_feature)
		batch.update(doc(db, Features._, feature.prev_feature), {
			next_feature: feature.next_feature,
		} satisfies Partial<Feature>)
	if (feature.next_feature)
		batch.update(doc(db, Features._, feature.next_feature), {
			prev_feature: feature.prev_feature,
		} satisfies Partial<Feature>)
	stories.forEach((story) => void batch.delete(doc(db, Stories._, story.id)))
	batch.update(doc(db, Epics._, epic.id), {
		features: epic.features.filter((id) => id !== feature.id),
	} satisfies Partial<Epic>)
	batch.delete(doc(db, Features._, featureId))
	await batch.commit()
}

type AddStoryInput = {
	description: string
	name: string
	version: Id
}

export const addStory =
	(productId: Id, epicId: Id, featureId: Id) =>
	async ({description, name, version}: AddStoryInput): Promise<void> => {
		const lastStoryData = (
			await getDocs(
				query(
					collection(db, Stories._),
					where(Stories.feature, `==`, featureId),
					where(Stories.next_story, `==`, null),
				),
			)
		).docs[0]
		const lastStory = lastStoryData ? StorySchema.parse({id: lastStoryData.id, ...lastStoryData.data()}) : null

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
			next_story: null,
			prev_story: lastStory?.id ?? null,
			product: productId,
			version,
		}
		const newStoryDoc = await addDoc(collection(db, Stories._), data)
		if (lastStoryData) {
			updateDoc(doc(db, Stories._, lastStoryData.id), {
				next_story: newStoryDoc.id as Id,
			} satisfies Partial<Story>)
			updateDoc(doc(db, Features._, featureId), {
				stories: arrayUnion(newStoryDoc.id) as unknown as Id[],
			} satisfies Partial<Feature>)
		}
	}

const getStoriesByEpic = (epicId: Id) => async (): Promise<Story[]> => {
	const _data = await getDocs(query(collection(db, Stories._), where(Stories.epic, `==`, epicId)))
	const data = StoryCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

const getStoriesByFeature = (featureId: Id) => async (): Promise<Story[]> => {
	const _data = await getDocs(query(collection(db, Stories._), where(Stories.feature, `==`, featureId)))
	const data = StoryCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
}

export const getAllStories = (productId: Id) => async (): Promise<Story[]> => {
	const _data = await getDocs(query(collection(db, Stories._), where(Stories.product, `==`, productId)))
	const data = StoryCollectionSchema.parse(_data.docs.map((doc) => ({id: doc.id, ...doc.data()})))
	return data
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

export const deleteStory = (storyId: Id) => async (): Promise<void> => {
	const storyDoc = await getDoc(doc(db, Stories._, storyId))
	const story = StorySchema.parse({id: storyDoc.id, ...storyDoc.data()})

	const feature = await getFeature(story.feature)()

	const batch = writeBatch(db)
	if (story.prev_story)
		batch.update(doc(db, Stories._, story.prev_story), {next_story: story.next_story} satisfies Partial<Story>)
	if (story.next_story)
		batch.update(doc(db, Stories._, story.next_story), {prev_story: story.prev_story} satisfies Partial<Story>)
	batch.update(doc(db, Features._, feature.id), {
		stories: feature.stories.filter((id) => id !== story.id),
	} satisfies Partial<Feature>)
	batch.delete(doc(db, Stories._, storyId))
	await batch.commit()
}
