import {Timestamp} from "firebase9/firestore"
import {z, ZodTypeAny} from "zod"

// Workaround https://github.com/swc-project/swc/issues/6514
Timestamp

export type Feature = {
	id: string
	name: string
	description: string
	comments: string[]
	stories: Story[]
}

export type Story = {
	id: string
	name: string
	description: string
	comments: string[]
	accepanceCriteria: Array<{
		name: string
		checked: boolean
	}>
}

export type Epics = {
	id: string

	name: string
	description: string
	keepers: string[]
	comments: string[]
	features: Feature[]

	product_id: string
	version: string
	updatedAt: Timestamp
}

export const EpicsSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	keepers: z.array(z.string()),
	comments: z.array(z.string()),
	features: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			description: z.string(),
			comments: z.array(z.string()),
			stories: z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					description: z.string(),
					comments: z.array(z.string()),
					accepanceCriteria: z.array(
						z.object({
							name: z.string(),
							checked: z.boolean(),
						}),
					),
				}),
			),
		}),
	),
	product_id: z.string(),
	version: z.string(),
	updatedAt: z.instanceof(Timestamp),
} satisfies {[key in keyof Epics]: ZodTypeAny})

export const EpicsCollectionSchema = z.array(EpicsSchema)
