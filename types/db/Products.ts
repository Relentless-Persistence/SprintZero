import {Timestamp} from "firebase9/firestore"
import {z} from "zod"

import {genDbNames, idSchema} from "~/types"

export const EpicSchema = z.object({
	id: idSchema,

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	commentIds: z.array(idSchema),
	featureIds: z.array(idSchema),
	keeperIds: z.array(idSchema),
	nameInputStateId: idSchema,
})
export type Epic = z.infer<typeof EpicSchema>

export const FeatureSchema = z.object({
	id: idSchema,

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	commentIds: z.array(idSchema),
	nameInputStateId: idSchema,
	storyIds: z.array(idSchema),
})
export type Feature = z.infer<typeof FeatureSchema>

export const StorySchema = z.object({
	id: idSchema,

	acceptanceCriteria: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	branchName: z.string().nullable(),
	description: z.string(),
	designLink: z.string().url().nullable(),
	ethicsApproved: z.boolean().nullable(),
	ethicsColumn: z.union([z.literal(`identified`), z.literal(`underReview`), z.literal(`adjudicated`)]).nullable(),
	ethicsVotes: z.array(
		z.object({
			userId: idSchema,
			vote: z.boolean(),
		}),
	),
	name: z.string(),
	pageLink: z.string().url().nullable(),
	points: z.number(),
	sprintColumn: z.union([
		z.literal(`productBacklog`),
		z.literal(`designBacklog`),
		z.literal(`designing`),
		z.literal(`critique`),
		z.literal(`devReady`),
		z.literal(`devBacklog`),
		z.literal(`developing`),
		z.literal(`designReview`),
		z.literal(`codeReview`),
		z.literal(`qa`),
		z.literal(`productionQueue`),
		z.literal(`shipped`),
	]),

	commentIds: z.array(idSchema),
	nameInputStateId: idSchema,
	versionId: idSchema,
})
export type Story = z.infer<typeof StorySchema>

export const ProductSchema = z.object({
	id: idSchema,

	// General product info
	cadence: z.number(),
	effortCost: z.number().nullable(),
	gate: z.union([
		z.literal(`Monday`),
		z.literal(`Tuesday`),
		z.literal(`Wednesday`),
		z.literal(`Thursday`),
		z.literal(`Friday`),
		z.literal(`Saturday`),
		z.literal(`Sunday`),
	]),
	members: z.record(
		idSchema,
		z.object({
			type: z.union([z.literal(`editor`), z.literal(`viewer`)]),
		}),
	),

	name: z.string(),

	// Story map info
	storyMapState: z.object({
		epics: z.array(EpicSchema),
		features: z.array(FeatureSchema),
		stories: z.array(StorySchema),

		productId: idSchema,
	}),

	// Kickoff info
	problemStatement: z.string(),
	personas: z.array(z.object({id: z.string(), text: z.string()})),
	successMetrics: z.array(z.object({id: z.string(), text: z.string()})),
	businessPriorities: z.array(z.object({id: z.string(), text: z.string()})),

	// Accessibility info
	accessibilityMissionStatements: z.object({
		auditory: z.string(),
		cognitive: z.string(),
		physical: z.string(),
		speech: z.string(),
		visual: z.string(),
	}),

	// Vision info
	productType: z.union([
		z.literal(`mobile`),
		z.literal(`tablet`),
		z.literal(`desktop`),
		z.literal(`watch`),
		z.literal(`web`),
	]),
	valueProposition: z.string(),
	features: z.array(z.object({id: z.string(), text: z.string()})),
	finalVision: z.string(),
	updates: z.array(
		z.object({
			id: z.string(),
			userId: idSchema,
			text: z.string(),
			timestamp: z.instanceof(Timestamp),
		}),
	),
})

export const Products = genDbNames(`Products`, ProductSchema)
export type Product = z.infer<typeof ProductSchema>
export type StoryMapState = Product[`storyMapState`]

export const sprintColumns = {
	productBacklog: `Product Backlog`,
	designBacklog: `Design Sprint Backlog`,
	designing: `Designing`,
	critique: `Critique`,
	devReady: `Design Done / Dev Ready`,
	devBacklog: `Dev Sprint Backlog`,
	developing: `Developing`,
	designReview: `Design Review`,
	codeReview: `Peer Code Review`,
	qa: `QA`,
	productionQueue: `Production Queue`,
	shipped: `Shipped`,
}
