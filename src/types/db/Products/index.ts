import {z} from "zod"

import {genConverter, timestampSchema} from "~/types"

export const productTypes = [
	[`mobile`, `Mobile`],
	[`tablet`, `Tablet`],
	[`desktop`, `Desktop`],
	[`watch`, `Watch`],
	[`web`, `Web`],
	[`augmentedReality`, `Augmented Reality`],
	[`virtualReality`, `Virtual Reality`],
	[`artificialIntelligence`, `Artificial Intelligence`],
	[`humanoid`, `Humanoid`],
	[`api`, `API`],
] as const

export const ProductSchema = z.object({
	// General product info
	cadence: z.number(),
	createdAt: timestampSchema,
	effortCost: z.number().nullable(),
	effortCostCurrencySymbol: z.enum([`dollar`, `euro`, `pound`, `yen`, `rupee`]).nullable(),
	sprintStartDayOfWeek: z.number().int().min(0).max(6),
	name: z.string({invalid_type_error: `Required`}).min(1),

	id: z.string(),

	// Story map info
	storyMapCurrentHistoryId: z.string().nullable(),
	storyMapUpdatedAt: timestampSchema,

	// Kickoff info
	problemStatement: z.string(),

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
	finalVision: z.string(),
	productTypes: z.array(z.enum(productTypes.map(([value]) => value) as [string])),
	valueProposition: z.string({invalid_type_error: `Required`}).min(1, `Required`).nullable(),
})

export type Product = z.infer<typeof ProductSchema>
export const ProductConverter = genConverter(ProductSchema)
