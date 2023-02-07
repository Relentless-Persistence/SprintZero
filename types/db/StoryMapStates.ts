import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter, genDbNames, idSchema} from "~/types"

export const EpicSchema = z.object({
	id: z.string(),

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	commentIds: z.array(idSchema),
	featureIds: z.array(z.string()),
	keeperIds: z.array(idSchema),
})
export type Epic = z.infer<typeof EpicSchema>

export const FeatureSchema = z.object({
	id: z.string(),

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	commentIds: z.array(idSchema),
	storyIds: z.array(z.string()),
})
export type Feature = z.infer<typeof FeatureSchema>

export const StorySchema = z.object({
	id: z.string(),

	acceptanceCriteria: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	branchName: z.string().nullable(),
	createdAt: z.instanceof(Timestamp),
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
	sprintColumn: z.enum([
		`productBacklog`,
		`designBacklog`,
		`designing`,
		`critique`,
		`devReady`,
		`devBacklog`,
		`developing`,
		`designReview`,
		`codeReview`,
		`qa`,
		`productionQueue`,
		`shipped`,
	]),

	commentIds: z.array(idSchema),
	versionId: z.string(),
})
export type Story = z.infer<typeof StorySchema>

export const StoryMapStateSchema = z.object({
	epics: z.array(EpicSchema),
	features: z.array(FeatureSchema),
	stories: z.array(StorySchema),

	productId: idSchema,
})

export const StoryMapStates = genDbNames(`StoryMapStates`, StoryMapStateSchema)
export type StoryMapState = z.infer<typeof StoryMapStateSchema>

export const StoryMapStateConverter = genConverter(StoryMapStateSchema)

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
