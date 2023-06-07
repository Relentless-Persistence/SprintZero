import { z } from "zod"

import { genConverter, timestampSchema } from "~/types"

export const DialogueParticipantSchema = z.object({
	availability: z.array(z.enum([`95only`, `email`, `phone`, `text`, `weekdays`, `weekends`])),
	disabilities: z.object({
		auditory: z.boolean(),
		cognitive: z.boolean(),
		physical: z.boolean(),
		speech: z.boolean(),
		visual: z.boolean(),
	}),
	audioFilePath: z.string(),
	email: z.string().email().nullable(),
	location: z.string(),
	location_id: z.string(),
	name: z.string({ invalid_type_error: `Required` }),
	phoneNumber: z.string().nullable(),
	status: z.enum([`identified`, `contacted`, `scheduled`, `interviewed`, `analyzing`, `processed`, `archived`]),
	timing: z.enum([`permanent`, `temporary`, `situational`]).nullable().optional(),
	title: z.enum([`dr`, `miss`, `mr`, `mrs`, `ms`, `prof`, `sir`]).nullable(),
	transcript: z.string(),
	transcriptAudio: z.string(),
	updatedAt: timestampSchema,
	wiki_link: z.string(),

	personaId: z.string().nullable(),
	updatedAtUserId: z.string(),
})

export type DialogueParticipant = z.infer<typeof DialogueParticipantSchema>
export const DialogueParticipantConverter = genConverter(DialogueParticipantSchema)

export const statuses = {
	identified: `Identified`,
	contacted: `Contacted`,
	scheduled: `Scheduled`,
	interviewed: `Interviewed`,
	analyzing: `Analyzing`,
	processed: `Processed`,
	archived: `Archived`,
}

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
