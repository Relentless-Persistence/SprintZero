import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const EpicSchema = z.object({
	type: z.literal(`epic`),

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	keeperIds: z.array(idSchema),
})
export type Epic = z.infer<typeof EpicSchema>

export const FeatureSchema = z.object({
	type: z.literal(`feature`),

	description: z.string(),
	effort: z.number().min(0).max(1),
	name: z.string(),
	userValue: z.number().min(0).max(1),

	parentId: idSchema,
})
export type Feature = z.infer<typeof FeatureSchema>

export const StorySchema = z.object({
	type: z.literal(`story`),

	acceptanceCriteria: z.array(
		z.object({
			id: idSchema,
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	branchName: z.string().nullable(),
	createdAt: z.instanceof(Timestamp),
	description: z.string(),
	designLink: z.string().url().nullable(),
	ethicsApproved: z.boolean().nullable(),
	ethicsColumn: z.enum([`identified`, `underReview`, `adjudicated`]).nullable(),
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

	parentId: idSchema,
	versionId: idSchema,
})
export type Story = z.infer<typeof StorySchema>

export const StoryMapStateSchema = z.object({
	items: z.record(idSchema, z.discriminatedUnion(`type`, [EpicSchema, FeatureSchema, StorySchema])),

	productId: idSchema,
})

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
