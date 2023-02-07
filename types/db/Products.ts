import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genDbNames, idSchema, genConverter} from "~/types"

export const ProductSchema = z.object({
	// General product info
	cadence: z.number(),
	effortCost: z.number().nullable(),
	sprintStartDayOfWeek: z.number().int().min(0).max(6),
	members: z.record(
		idSchema,
		z.object({
			type: z.enum([`editor`, `viewer`]),
		}),
	),
	name: z.string().min(1),

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
	productType: z.enum([`mobile`, `tablet`, `desktop`, `watch`, `web`]),
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

export const kickoffSections = {
	problemStatement: `Problem Statement`,
	personas: `Personas`,
	successMetrics: `Success Metrics`,
	businessPriorities: `Business Priorities`,
}
