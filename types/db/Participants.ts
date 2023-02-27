import {Timestamp} from "firebase/firestore"
import {z} from "zod"

import {genConverter, idSchema} from "~/types"

export const ParticipantSchema = z.object({
	availability: z.array(z.enum([`95only`, `email`, `phone`, `text`, `weekdays`, `weekends`])),
	disabilities: z.object({
		auditory: z.boolean(),
		cognitive: z.boolean(),
		physical: z.boolean(),
		speech: z.boolean(),
		visual: z.boolean(),
	}),
	email: z.string().email().nullable(),
	location: z.string(),
	name: z.string().nullable(),
	phoneNumber: z.string().nullable(),
	status: z.enum([`identified`, `contacted`, `scheduled`, `interviewed`, `analyzing`, `processed`, `archived`]),
	timing: z.enum([`permanent`, `temporary`, `situational`]),
	title: z.enum([`dr`, `miss`, `mr`, `mrs`, `ms`, `prof`, `sir`]).nullable(),
	transcript: z.string(),
	updatedAt: z.instanceof(Timestamp),

	personaIds: z.array(idSchema),
	productId: idSchema,
	updatedAtUserId: idSchema,
})

export type Participant = z.infer<typeof ParticipantSchema>
export const ParticipantConverter = genConverter(ParticipantSchema)

export const statuses = [
	[`identified`, `Identified`],
	[`contacted`, `Contacted`],
	[`scheduled`, `Scheduled`],
	[`interviewed`, `Interviewed`],
	[`analyzing`, `Analyzing`],
	[`processed`, `Processed`],
	[`archived`, `Archived`],
]

export const timings = [
	[`permanent`, `Permanent`],
	[`temporary`, `Temporary`],
	[`situational`, `Situational`],
]

export const titles = [
	[`dr`, `Dr.`],
	[`miss`, `Miss`],
	[`mr`, `Mr.`],
	[`mrs`, `Mrs.`],
	[`ms`, `Ms.`],
	[`prof`, `Prof.`],
	[`sir`, `Sir`],
]
