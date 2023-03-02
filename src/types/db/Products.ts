import {z} from "zod"

import {genConverter, idSchema, timestampSchema} from "~/types"

export const ProductSchema = z.object({
	// General product info
	cadence: z.number(),
	createdAt: timestampSchema,
	effortCost: z.number().nullable(),
	effortCostCurrencySymbol: z.enum([`dollar`, `euro`, `pound`, `yen`, `rupee`]).nullable(),
	sprintStartDayOfWeek: z.number().int().min(0).max(6),
	members: z.record(
		idSchema,
		z.object({
			type: z.enum([`owner`, `editor`, `viewer`]),
		}),
	),
	name: z.string().min(1),

	// Kickoff info
	businessOutcomes: z.array(z.object({id: idSchema, text: z.string()})),
	marketLeaders: z.array(z.object({id: idSchema, text: z.string()})),
	potentialRisks: z.array(z.object({id: idSchema, text: z.string()})),
	problemStatement: z.string(),
	userPriorities: z.array(z.object({id: idSchema, text: z.string()})),

	// Accessibility info
	accessibility: z.object({
		auditory: z.tuple([z.boolean(), z.boolean(), z.boolean(), z.boolean(), z.boolean()]),
		cognitive: z.tuple([z.boolean(), z.boolean(), z.boolean(), z.boolean(), z.boolean(), z.boolean()]),
		physical: z.tuple([z.boolean(), z.boolean(), z.boolean(), z.boolean(), z.boolean()]),
		speech: z.tuple([z.boolean(), z.boolean()]),
		visual: z.tuple([
			z.boolean(),
			z.boolean(),
			z.boolean(),
			z.boolean(),
			z.boolean(),
			z.boolean(),
			z.boolean(),
			z.boolean(),
		]),
	}),

	// Vision info
	productType: z.enum([`mobile`, `tablet`, `desktop`, `watch`, `web`]),
	valueProposition: z.string({invalid_type_error: `Required`}).min(1, `Required`).nullable(),
	features: z
		.array(z.object({id: idSchema, text: z.string().min(1, `Required`)}))
		.min(1, `Required`)
		.nullable(),
	finalVision: z.string(),
	updates: z.array(
		z.object({
			id: z.string(),
			userId: idSchema,
			text: z.string(),
			timestamp: timestampSchema,
		}),
	),

	// Huddle info
	huddles: z.record(
		idSchema,
		z.object({
			updatedAt: timestampSchema,

			blockerStoryIds: z.array(idSchema),
			todayStoryIds: z.array(idSchema),
			yesterdayStoryIds: z.array(idSchema),
		}),
	),
})

export type Product = z.infer<typeof ProductSchema>
export const ProductConverter = genConverter(ProductSchema)
