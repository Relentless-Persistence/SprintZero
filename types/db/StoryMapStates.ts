import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter, idSchema, serverTimestampSchema} from "~/types"

const schemas = {
	acceptanceCriteria: z.array(
		z.object({
			id: idSchema,
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	branchName: z.string().nullable(),
	bugs: z.array(
		z.object({
			id: idSchema,
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	createdAt: z.instanceof(Timestamp),
	description: z.string(),
	designEffort: z.number().min(1),
	designLink: z.string().url().nullable(),
	effort: z.number().min(0).max(1),
	engineeringEffort: z.number().min(1),
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
	updatedAt: serverTimestampSchema,
	userValue: z.number().min(0).max(1),

	keeperIds: z.array(idSchema),
	parentId: idSchema,
	peopleIds: z.array(idSchema),
	updatedAtUserId: idSchema,
	versionId: idSchema,
}

export const EpicSchema = z.object({
	type: z.literal(`epic`),

	description: schemas.description,
	effort: schemas.effort,
	name: schemas.name,
	userValue: schemas.userValue,

	keeperIds: schemas.keeperIds,

	// Fields from other item types
	acceptanceCriteria: schemas.acceptanceCriteria.nullable(),
	branchName: schemas.branchName.nullable(),
	bugs: schemas.bugs.nullable(),
	createdAt: schemas.createdAt.nullable(),
	designLink: schemas.designLink.nullable(),
	designEffort: schemas.designEffort.nullable(),
	engineeringEffort: schemas.engineeringEffort.nullable(),
	ethicsApproved: schemas.ethicsApproved.nullable(),
	ethicsColumn: schemas.ethicsColumn.nullable(),
	ethicsVotes: schemas.ethicsVotes.nullable(),
	pageLink: schemas.pageLink.nullable(),
	sprintColumn: schemas.sprintColumn.nullable(),
	updatedAt: schemas.updatedAt.nullable(),
	parentId: schemas.parentId.nullable(),
	peopleIds: schemas.peopleIds.nullable(),
	updatedAtUserId: schemas.updatedAtUserId.nullable(),
	versionId: schemas.versionId.nullable(),
} satisfies Record<keyof typeof schemas | `type`, unknown>)
export type Epic = z.infer<typeof EpicSchema>

export const FeatureSchema = z.object({
	type: z.literal(`feature`),

	description: schemas.description,
	effort: schemas.effort,
	name: schemas.name,
	userValue: schemas.userValue,

	parentId: schemas.parentId,

	// Fields from other item types
	acceptanceCriteria: schemas.acceptanceCriteria.nullable(),
	branchName: schemas.branchName.nullable(),
	bugs: schemas.bugs.nullable(),
	createdAt: schemas.createdAt.nullable(),
	designEffort: schemas.designEffort.nullable(),
	designLink: schemas.designLink.nullable(),
	engineeringEffort: schemas.engineeringEffort.nullable(),
	ethicsApproved: schemas.ethicsApproved.nullable(),
	ethicsColumn: schemas.ethicsColumn.nullable(),
	ethicsVotes: schemas.ethicsVotes.nullable(),
	pageLink: schemas.pageLink.nullable(),
	sprintColumn: schemas.sprintColumn.nullable(),
	updatedAt: schemas.updatedAt.nullable(),
	keeperIds: schemas.keeperIds.nullable(),
	peopleIds: schemas.peopleIds.nullable(),
	updatedAtUserId: schemas.updatedAtUserId.nullable(),
	versionId: schemas.versionId.nullable(),
} satisfies Record<keyof typeof schemas | `type`, unknown>)
export type Feature = z.infer<typeof FeatureSchema>

export const StorySchema = z.object({
	type: z.literal(`story`),

	acceptanceCriteria: schemas.acceptanceCriteria,
	branchName: schemas.branchName,
	bugs: schemas.bugs,
	createdAt: schemas.createdAt,
	description: schemas.description,
	designEffort: schemas.designEffort,
	designLink: schemas.designLink,
	engineeringEffort: schemas.engineeringEffort,
	ethicsApproved: schemas.ethicsApproved,
	ethicsColumn: schemas.ethicsColumn,
	ethicsVotes: schemas.ethicsVotes,
	name: schemas.name,
	pageLink: schemas.pageLink,
	sprintColumn: schemas.sprintColumn,
	updatedAt: schemas.updatedAt,

	parentId: schemas.parentId,
	peopleIds: schemas.peopleIds,
	updatedAtUserId: schemas.updatedAtUserId,
	versionId: schemas.versionId,

	// Fields from other item types
	effort: schemas.effort.nullable(),
	userValue: schemas.userValue.nullable(),
	keeperIds: schemas.keeperIds.nullable(),
} satisfies Record<keyof typeof schemas | `type`, unknown>)
export type Story = z.infer<typeof StorySchema>

export const StoryMapStateSchema = z.object({
	items: z.record(idSchema, z.discriminatedUnion(`type`, [EpicSchema, FeatureSchema, StorySchema])),
	updatedAt: serverTimestampSchema,

	currentHistoryId: idSchema,
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
