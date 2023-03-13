import {z} from "zod"

import {genConverter, serverTimestampSchema, timestampSchema} from "~/types"

const schemas = {
	acceptanceCriteria: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	branchName: z.string().nullable(),
	bugs: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			checked: z.boolean(),
		}),
	),
	createdAt: timestampSchema,
	description: z.string(),
	designEffort: z.number().min(1),
	designLink: z.string().url().nullable(),
	effort: z.number().min(0).max(1),
	engineeringEffort: z.number().min(1),
	ethicsApproved: z.boolean().nullable(),
	ethicsColumn: z.enum([`underReview`, `adjudicated`]).nullable(),
	ethicsVotes: z.record(z.string(), z.boolean()),
	name: z.string(),
	pageLink: z.string().url().nullable(),
	sprintColumn: z.enum([
		`releaseBacklog`,
		`sprintBacklogDesign`,
		`designing`,
		`critique`,
		`prototyping`,
		`userTesting`,
		`readyForDev`,
		`sprintBacklogDev`,
		`developing`,
		`codeReview`,
		`designSignOff`,
		`userAcceptanceTesting`,
		`readyToShip`,
		`shipped`,
	]),
	updatedAt: timestampSchema,
	userValue: z.number().min(0).max(1),

	keeperIds: z.array(z.string()),
	parentId: z.string(),
	peopleIds: z.array(z.string()),
	updatedAtUserId: z.string(),
	versionId: z.string(),
}

export const EpicSchema = z.object({
	type: z.literal(`epic`),

	createdAt: schemas.createdAt,
	description: schemas.description,
	effort: schemas.effort,
	name: schemas.name,
	userValue: schemas.userValue,

	keeperIds: schemas.keeperIds,

	// Fields from other item types
	acceptanceCriteria: schemas.acceptanceCriteria.nullable(),
	branchName: schemas.branchName.nullable(),
	bugs: schemas.bugs.nullable(),
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

	createdAt: schemas.createdAt,
	description: schemas.description,
	effort: schemas.effort,
	name: schemas.name,
	userValue: schemas.userValue,

	parentId: schemas.parentId,

	// Fields from other item types
	acceptanceCriteria: schemas.acceptanceCriteria.nullable(),
	branchName: schemas.branchName.nullable(),
	bugs: schemas.bugs.nullable(),
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

export const OldStoryMapStateSchema = z.object({
	items: z.record(z.string(), z.discriminatedUnion(`type`, [EpicSchema, FeatureSchema, StorySchema])),
	updatedAt: serverTimestampSchema,

	currentHistoryId: z.string(),
	productId: z.string(),
})

export type StoryMapState = z.infer<typeof OldStoryMapStateSchema>
export const StoryMapStateConverter = genConverter(OldStoryMapStateSchema)

export const sprintColumns = {
	releaseBacklog: `Release Backlog`,
	sprintBacklogDesign: `Sprint Backlog / Design`,
	designing: `Designing`,
	critique: `Critique`,
	prototyping: `Prototyping`,
	userTesting: `User Testing`,
	readyForDev: `Ready for Dev`,
	sprintBacklogDev: `Sprint Backlog / Dev`,
	developing: `Developing`,
	codeReview: `Peer Code Review`,
	designSignOff: `Design Sign-Off`,
	userAcceptanceTesting: `User Acceptance Testing`,
	readyToShip: `Ready to Ship`,
	shipped: `Shipped`,
}
