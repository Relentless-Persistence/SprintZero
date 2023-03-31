import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const StoryMapItemSchema = z.object({
	id: z.string(),

	acceptanceCriteria: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				checked: z.boolean(),
			}),
		)
		.default([]),
	branchName: z.string().nullable().default(null),
	bugs: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				checked: z.boolean(),
			}),
		)
		.default([]),
	createdAt: timestampSchema,
	deleted: z.boolean().default(false),
	description: z.string(),
	designEffort: z.number().int().min(1).default(1),
	designLink: z.string().url().nullable(),
	effort: z.number().min(0).max(1).default(0.5),
	engineeringEffort: z.number().int().min(1).default(1),
	ethicsApproved: z.boolean().nullable().default(null),
	ethicsColumn: z.enum([`underReview`, `adjudicated`]).nullable().default(null),
	ethicsVotes: z.record(z.string(), z.boolean()).default({}),
	initialRenameDone: z.boolean(),
	name: z.string().min(1),
	pageLink: z.string().url().nullable().default(null),
	sprintColumn: z
		.enum([
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
		])
		.default(`releaseBacklog`),
	roadmap: z
		.object({
			x: z.number(),
			y: z.number(),
		})
		.optional(),
	updatedAt: timestampSchema,
	userValue: z.number().min(0).max(1).default(0.5),

	keeperIds: z.array(z.string()).default([]),
	parentId: z.string().nullable(),
	peopleIds: z.array(z.string()).default([]),
	updatedAtUserId: z.string(),
	versionId: z.string().nullable().default(null),
})

export type StoryMapItem = z.infer<typeof StoryMapItemSchema>
export const StoryMapItemConverter = genConverter(StoryMapItemSchema)

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
