import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genDbNames, idSchema, genConverter} from "~/types"

export const ProductSchema = z.object({
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

	storyMapStateId: idSchema,

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
export const ProductConverter = genConverter(ProductSchema)

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
