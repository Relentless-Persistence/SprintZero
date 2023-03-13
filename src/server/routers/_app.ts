import {FieldValue, Timestamp} from "firebase-admin/firestore"
import {Configuration, OpenAIApi} from "openai"
import {z} from "zod"

import {funCardRouter} from "./funCard"
import {productRouter} from "./product"
import {userInviteRouter} from "./userInvite"
import {procedure, router} from "../trpc"
import {genAdminConverter} from "~/types"
import {OldCommentSchema} from "~/types/db/_old/Comments"
import {OldHistorySchema} from "~/types/db/_old/Histories"
import {OldInsightSchema} from "~/types/db/_old/Insights"
import {OldJourneyEventSchema} from "~/types/db/_old/JourneyEvents"
import {OldJourneySchema} from "~/types/db/_old/Journeys"
import {OldObjectiveSchema} from "~/types/db/_old/Objectives"
import {OldParticipantSchema} from "~/types/db/_old/Participants"
import {OldPersonaSchema} from "~/types/db/_old/Personas"
import {OldProductInviteSchema} from "~/types/db/_old/ProductInvites"
import {OldProductSchema} from "~/types/db/_old/Products"
import {OldResultSchema} from "~/types/db/_old/Results"
import {OldRetrospectiveItemSchema} from "~/types/db/_old/RetrospectiveItems"
import {OldStoryMapStateSchema} from "~/types/db/_old/StoryMapStates"
import {OldTaskSchema} from "~/types/db/_old/Tasks"
import {OldUserSchema} from "~/types/db/_old/Users"
import {OldVersionSchema} from "~/types/db/_old/Versions"
import {ProductSchema} from "~/types/db/Products"
import {BusinessOutcomeSchema} from "~/types/db/Products/BusinessOutcomes"
import {DialogueParticipantSchema} from "~/types/db/Products/DialogueParticipants"
import {FeatureSchema} from "~/types/db/Products/Features"
import {HuddleSchema} from "~/types/db/Products/Huddles"
import {InsightSchema} from "~/types/db/Products/Insights"
import {InviteSchema} from "~/types/db/Products/Invites"
import {JourneySchema} from "~/types/db/Products/Journeys"
import {EventSchema} from "~/types/db/Products/Journeys/Events"
import {MarketLeaderSchema} from "~/types/db/Products/MarketLeaders"
import {MemberSchema} from "~/types/db/Products/Members"
import {ObjectiveSchema} from "~/types/db/Products/Objectives"
import {ResultSchema} from "~/types/db/Products/Objectives/Results"
import {PersonaSchema} from "~/types/db/Products/Personas"
import {ChangeSchema} from "~/types/db/Products/Personas/Changes"
import {DayInTheLifeSchema} from "~/types/db/Products/Personas/DaysInTheLife"
import {FrustrationSchema} from "~/types/db/Products/Personas/Frustrations"
import {GoalSchema} from "~/types/db/Products/Personas/Goals"
import {InteractionSchema} from "~/types/db/Products/Personas/Interactions"
import {PersonaTaskSchema} from "~/types/db/Products/Personas/PersonaTasks"
import {PrioritySchema} from "~/types/db/Products/Personas/Priorities"
import {ResponsibilitySchema} from "~/types/db/Products/Personas/Responsibilities"
import {PotentialRiskSchema} from "~/types/db/Products/PotentialRisks"
import {RetrospectiveItemSchema} from "~/types/db/Products/RetrospectiveItems"
import {StoryMapHistorySchema} from "~/types/db/Products/StoryMapHistories"
import {HistoryItemSchema} from "~/types/db/Products/StoryMapHistories/HistoryItems"
import {StoryMapItemSchema} from "~/types/db/Products/StoryMapItems"
import {CommentSchema} from "~/types/db/Products/StoryMapItems/Comments"
import {TaskSchema} from "~/types/db/Products/Tasks"
import {UserPrioritySchema} from "~/types/db/Products/UserPriorities"
import {VersionSchema} from "~/types/db/Products/Versions"
import {VisionUpdateSchema} from "~/types/db/Products/VisionUpdates"
import {UserSchema} from "~/types/db/Users"
import {dbAdmin} from "~/utils/firebaseAdmin"

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const appRouter = router({
	funCard: funCardRouter,
	product: productRouter,
	userInvite: userInviteRouter,

	gpt: procedure.input(z.object({prompt: z.string()})).mutation(async ({input: {prompt}}) => {
		const response = await openai.createCompletion({
			model: `text-davinci-003`,
			prompt,
			temperature: 0.8,
			max_tokens: 3000,
			top_p: 0.8,
			frequency_penalty: 1,
			presence_penalty: 0,
		})
		return {
			response: response.data.choices[0]?.text,
		}
	}),
	migrateSchema: procedure.mutation(async () => {
		const [
			allComments,
			allHistories,
			allInsights,
			allJourneyEvents,
			allJourneys,
			allObjectives,
			allParticipants,
			allPersonas,
			allProductInvites,
			allProducts,
			allResults,
			allRetrospectiveItems,
			allStoryMapStates,
			allTasks,
			allUsers,
			allVersions,
		] = await Promise.all([
			dbAdmin.collection(`Comments`).withConverter(genAdminConverter(OldCommentSchema)).get(),
			dbAdmin.collection(`Histories`).withConverter(genAdminConverter(OldHistorySchema)).get(),
			dbAdmin.collection(`Insights`).withConverter(genAdminConverter(OldInsightSchema)).get(),
			dbAdmin.collection(`JourneyEvents`).withConverter(genAdminConverter(OldJourneyEventSchema)).get(),
			dbAdmin.collection(`Journeys`).withConverter(genAdminConverter(OldJourneySchema)).get(),
			dbAdmin.collection(`Objectives`).withConverter(genAdminConverter(OldObjectiveSchema)).get(),
			dbAdmin.collection(`Participants`).withConverter(genAdminConverter(OldParticipantSchema)).get(),
			dbAdmin.collection(`Personas`).withConverter(genAdminConverter(OldPersonaSchema)).get(),
			dbAdmin.collection(`ProductInvites`).withConverter(genAdminConverter(OldProductInviteSchema)).get(),
			dbAdmin.collection(`Products`).withConverter(genAdminConverter(OldProductSchema)).get(),
			dbAdmin.collection(`Results`).withConverter(genAdminConverter(OldResultSchema)).get(),
			dbAdmin.collection(`RetrospectiveItems`).withConverter(genAdminConverter(OldRetrospectiveItemSchema)).get(),
			dbAdmin.collection(`StoryMapStates`).withConverter(genAdminConverter(OldStoryMapStateSchema)).get(),
			dbAdmin.collection(`Tasks`).withConverter(genAdminConverter(OldTaskSchema)).get(),
			dbAdmin.collection(`Users`).withConverter(genAdminConverter(OldUserSchema)).get(),
			dbAdmin.collection(`Versions`).withConverter(genAdminConverter(OldVersionSchema)).get(),
		])

		// eslint-disable-next-line @typescript-eslint/require-await
		await dbAdmin.runTransaction(async (transaction) => {
			allProducts.docs.forEach((product) => {
				const insights = allInsights.docs.filter((doc) => doc.data().productId === product.id)
				const journeys = allJourneys.docs.filter((doc) => doc.data().productId === product.id)
				const objectives = allObjectives.docs.filter((doc) => doc.data().productId === product.id)
				const participants = allParticipants.docs.filter((doc) => doc.data().productId === product.id)
				const personas = allPersonas.docs.filter((doc) => doc.data().productId === product.id)
				const productInvites = allProductInvites.docs.filter((doc) => doc.data().productId === product.id)
				const retrospectiveItems = allRetrospectiveItems.docs.filter((doc) => doc.data().productId === product.id)
				const storyMapState = allStoryMapStates.docs.find((doc) => doc.data().productId === product.id)!
				const tasks = allTasks.docs.filter((doc) => doc.data().productId === product.id)

				const histories = allHistories.docs.filter((doc) => doc.ref.parent.parent?.id === storyMapState.id)
				const versions = allVersions.docs.filter((doc) => doc.ref.parent.parent?.id === storyMapState.id)

				transaction.set(
					dbAdmin.collection(`Products`).doc(product.id).withConverter(genAdminConverter(ProductSchema)),
					{
						cadence: product.data().cadence,
						createdAt: product.data().createdAt,
						effortCost: product.data().effortCost,
						effortCostCurrencySymbol: product.data().effortCostCurrencySymbol,
						sprintStartDayOfWeek: product.data().sprintStartDayOfWeek,
						name: product.data().name,
						id: product.id,

						storyMapCurrentHistoryId: storyMapState.data().currentHistoryId,
						storyMapUpdatedAt: storyMapState.data().updatedAt as Timestamp,

						problemStatement: product.data().problemStatement,

						accessibility: product.data().accessibility,

						finalVision: product.data().finalVision,
						productTypes: [product.data().productType],
						valueProposition: product.data().valueProposition,
					},
				)

				journeys.forEach((journey) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Journeys`)
							.doc(journey.id)
							.withConverter(genAdminConverter(JourneySchema)),
						{
							duration: journey.data().duration,
							durationUnit: journey.data().durationUnit,
							name: journey.data().name,
						},
					)

					const journeyEvents = allJourneyEvents.docs.filter((doc) => doc.ref.parent.parent?.id === journey.id)
					journeyEvents.forEach((journeyEvent) => {
						transaction.set(
							dbAdmin
								.doc(journey.ref.path)
								.collection(`Events`)
								.doc(journeyEvent.id)
								.withConverter(genAdminConverter(EventSchema)),
							{
								description: journeyEvent.data().description,
								emotion: journeyEvent.data().emotion,
								emotionLevel: journeyEvent.data().emotionLevel,
								end: journeyEvent.data().end,
								start: journeyEvent.data().start,
								subject: journeyEvent.data().subject,
								personaIds: journeyEvent.data().personaIds,
							},
						)
					})
				})

				objectives.forEach((objective) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Objectives`)
							.doc(objective.id)
							.withConverter(genAdminConverter(ObjectiveSchema)),
						{
							name: objective.data().name,
							statement: objective.data().statement,
						},
					)

					const results = allResults.docs.filter((doc) => doc.ref.parent.parent?.id === objective.id)
					results.forEach((result) => {
						transaction.set(
							dbAdmin
								.doc(objective.ref.path)
								.collection(`Results`)
								.doc(result.id)
								.withConverter(genAdminConverter(ResultSchema)),
							{
								createdAt: result.data().createdAt,
								text: result.data().text,
							},
						)
					})
				})

				personas.forEach((persona) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Personas`)
							.doc(persona.id)
							.withConverter(genAdminConverter(PersonaSchema)),
						{
							createdAt: persona.data().createdAt,
							description: persona.data().description,
							name: persona.data().name,
						},
					)

					persona.data().changes.forEach((change) => {
						transaction.set(
							dbAdmin.doc(persona.ref.path).collection(`Changes`).doc().withConverter(genAdminConverter(ChangeSchema)),
							{
								text: change.text,
							},
						)
					})

					persona.data().dayInTheLife.forEach((dayInTheLife) => {
						transaction.set(
							dbAdmin
								.doc(persona.ref.path)
								.collection(`DaysInTheLife`)
								.doc()
								.withConverter(genAdminConverter(DayInTheLifeSchema)),
							{
								text: dayInTheLife.text,
							},
						)
					})

					persona.data().frustrations.forEach((frustration) => {
						transaction.set(
							dbAdmin
								.doc(persona.ref.path)
								.collection(`Frustrations`)
								.doc()
								.withConverter(genAdminConverter(FrustrationSchema)),
							{
								text: frustration.text,
							},
						)
					})

					persona.data().goals.forEach((goal) => {
						transaction.set(
							dbAdmin.doc(persona.ref.path).collection(`Goals`).doc().withConverter(genAdminConverter(GoalSchema)),
							{
								text: goal.text,
							},
						)
					})

					persona.data().interactions.forEach((interaction) => {
						transaction.set(
							dbAdmin
								.doc(persona.ref.path)
								.collection(`Interactions`)
								.doc()
								.withConverter(genAdminConverter(InteractionSchema)),
							{
								text: interaction.text,
							},
						)
					})

					persona.data().tasks.forEach((task) => {
						transaction.set(
							dbAdmin
								.doc(persona.ref.path)
								.collection(`PersonaTasks`)
								.doc()
								.withConverter(genAdminConverter(PersonaTaskSchema)),
							{
								text: task.text,
							},
						)
					})

					persona.data().priorities.forEach((priority) => {
						transaction.set(
							dbAdmin
								.doc(persona.ref.path)
								.collection(`Priorities`)
								.doc()
								.withConverter(genAdminConverter(PrioritySchema)),
							{
								text: priority.text,
							},
						)
					})

					persona.data().responsibilities.forEach((responsibility) => {
						transaction.set(
							dbAdmin
								.doc(persona.ref.path)
								.collection(`Responsibilities`)
								.doc()
								.withConverter(genAdminConverter(ResponsibilitySchema)),
							{
								text: responsibility.text,
							},
						)
					})
				})

				histories.forEach((history) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`StoryMapHistories`)
							.doc(history.id)
							.withConverter(genAdminConverter(StoryMapHistorySchema)),
						{
							future: history.data().future,
							timestamp: history.data().timestamp,
						},
					)

					for (const itemId in history.data().items) {
						const item = history.data().items[itemId]!
						transaction.set(
							dbAdmin
								.doc(product.ref.path)
								.collection(`StoryMapHistories`)
								.doc(history.id)
								.collection(`HistoryItems`)
								.doc(itemId)
								.withConverter(genAdminConverter(HistoryItemSchema)),
							{
								deleted: false,
								effort: `effort` in item ? item.effort : null,
								userValue: `userValue` in item ? item.userValue : null,
								parentId: `parentId` in item ? item.parentId : null,
								versionId: `versionId` in item ? item.versionId : null,
							},
						)
					}
				})

				for (const itemId in storyMapState.data().items) {
					const item = storyMapState.data().items[itemId]!
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`StoryMapItems`)
							.doc(itemId)
							.withConverter(genAdminConverter(StoryMapItemSchema)),
						{
							acceptanceCriteria: item.acceptanceCriteria ?? [],
							branchName: item.branchName,
							bugs: item.bugs ?? [],
							createdAt: item.createdAt,
							deleted: false,
							description: item.description,
							designEffort: item.designEffort ?? 1,
							designLink: item.designLink,
							effort: item.effort ?? 0.5,
							engineeringEffort: item.engineeringEffort ?? 1,
							ethicsApproved: item.ethicsApproved,
							ethicsColumn: item.ethicsColumn,
							ethicsVotes: item.ethicsVotes ?? {},
							initialRenameDone: true,
							name: item.name,
							pageLink: item.pageLink,
							sprintColumn: item.sprintColumn ?? `releaseBacklog`,
							updatedAt: item.updatedAt ?? Timestamp.now(),
							userValue: item.userValue ?? 0.5,
							keeperIds: item.keeperIds ?? [],
							parentId: item.parentId,
							peopleIds: item.peopleIds ?? [],
							updatedAtUserId: item.updatedAtUserId ?? ``,
							versionId: item.versionId,
						},
					)

					const comments = allComments.docs.filter((comment) => comment.data().parentId === itemId)
					comments.forEach((comment) => {
						transaction.set(
							dbAdmin
								.doc(product.ref.path)
								.collection(`StoryMapItems`)
								.doc(itemId)
								.collection(`Comments`)
								.doc(comment.id)
								.withConverter(genAdminConverter(CommentSchema)),
							{
								createdAt: comment.data().createdAt,
								text: comment.data().text,
								type: comment.data().type,
								authorId: comment.data().authorId,
							},
						)
					})
				}

				product.data().businessOutcomes.forEach((businessOutcome) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`BusinessOutcomes`)
							.doc()
							.withConverter(genAdminConverter(BusinessOutcomeSchema)),
						{
							text: businessOutcome.text,
						},
					)
				})

				participants.forEach((participant) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`DialogueParticipants`)
							.doc(participant.id)
							.withConverter(genAdminConverter(DialogueParticipantSchema)),
						{
							availability: participant.data().availability,
							disabilities: participant.data().disabilities,
							email: participant.data().email,
							location: participant.data().location,
							name: participant.data().name,
							phoneNumber: participant.data().phoneNumber,
							status: participant.data().status,
							timing: participant.data().timing,
							title: participant.data().title,
							transcript: participant.data().transcript,
							updatedAt: participant.data().updatedAt,
							personaId: participant.data().personaIds[0] ?? null,
							updatedAtUserId: participant.data().updatedAtUserId,
						},
					)
				})

				product.data().features?.forEach((feature) => {
					transaction.set(
						dbAdmin.doc(product.ref.path).collection(`Features`).doc().withConverter(genAdminConverter(FeatureSchema)),
						{
							text: feature.text,
						},
					)
				})

				for (const huddleId in product.data().huddles) {
					const huddle = product.data().huddles[huddleId]!
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Huddles`)
							.doc(huddleId)
							.withConverter(genAdminConverter(HuddleSchema)),
						{
							updatedAt: huddle.updatedAt,
							blockerStoryIds: huddle.blockerStoryIds,
							todayStoryIds: huddle.todayStoryIds,
							yesterdayStoryIds: huddle.yesterdayStoryIds,
						},
					)
				}

				insights.forEach((insight) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Insights`)
							.doc(insight.id)
							.withConverter(genAdminConverter(InsightSchema)),
						{
							status: insight.data().status,
							text: insight.data().text,
							title: insight.data().title,
						},
					)
				})

				productInvites.forEach((productInvite) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Invites`)
							.doc(productInvite.id)
							.withConverter(genAdminConverter(InviteSchema)),
						{
							email: productInvite.data().email,
							id: productInvite.id,
						},
					)
				})

				product.data().marketLeaders.forEach((marketLeader) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`MarketLeaders`)
							.doc()
							.withConverter(genAdminConverter(MarketLeaderSchema)),
						{
							text: marketLeader.text,
						},
					)
				})

				for (const memberId in product.data().members) {
					const member = product.data().members[memberId]!
					const user = allUsers.docs.find((user) => user.id === memberId)!
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Members`)
							.doc(memberId)
							.withConverter(genAdminConverter(MemberSchema)),
						{
							avatar: user.data().avatar,
							name: user.data().name,
							type: member.type,
							id: memberId,
						},
					)
				}

				product.data().potentialRisks.forEach((potentialRisk) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`PotentialRisks`)
							.doc()
							.withConverter(genAdminConverter(PotentialRiskSchema)),
						{
							text: potentialRisk.text,
						},
					)
				})

				retrospectiveItems.forEach((retrospectiveItem) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`RetrospectiveItems`)
							.doc(retrospectiveItem.id)
							.withConverter(genAdminConverter(RetrospectiveItemSchema)),
						{
							archived: retrospectiveItem.data().archived,
							createdAt: retrospectiveItem.data().createdAt,
							description: retrospectiveItem.data().description,
							proposedActions: retrospectiveItem.data().proposedActions,
							title: retrospectiveItem.data().title,
							type: retrospectiveItem.data().type,
							userId: retrospectiveItem.data().userId,
						},
					)
				})

				tasks.forEach((task) => {
					transaction.set(
						dbAdmin.doc(product.ref.path).collection(`Tasks`).doc(task.id).withConverter(genAdminConverter(TaskSchema)),
						{
							board: task.data().board,
							dueDate: task.data().dueDate,
							notes: task.data().notes,
							status: task.data().status,
							subtasks: task.data().subtasks,
							title: task.data().title,
							assigneeIds: task.data().assigneeIds,
						},
					)
				})

				product.data().userPriorities.forEach((userPriority) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`UserPriorities`)
							.doc()
							.withConverter(genAdminConverter(UserPrioritySchema)),
						{
							text: userPriority.text,
						},
					)
				})

				versions.forEach((version) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`Versions`)
							.doc(version.id)
							.withConverter(genAdminConverter(VersionSchema)),
						{
							deleted: false,
							name: version.data().name,
						},
					)
				})

				product.data().updates.forEach((update) => {
					transaction.set(
						dbAdmin
							.doc(product.ref.path)
							.collection(`VisionUpdates`)
							.doc(update.id)
							.withConverter(genAdminConverter(VisionUpdateSchema)),
						{
							text: update.text,
							timestamp: update.timestamp,
							userId: update.userId,
						},
					)
				})
			})

			allUsers.forEach((user) => {
				transaction.update(dbAdmin.doc(user.ref.path).withConverter(genAdminConverter(UserSchema)), {
					// @ts-ignore -- Legacy field
					avatar: FieldValue.delete(),
					// @ts-ignore -- Legacy field
					name: FieldValue.delete(),
					preferredMusicClient: `appleMusic`,
				})
			})

			allComments.forEach((comment) => {
				transaction.delete(comment.ref)
			})

			allHistories.forEach((history) => {
				transaction.delete(history.ref)
			})

			allInsights.forEach((insight) => {
				transaction.delete(insight.ref)
			})

			allJourneyEvents.forEach((journeyEvent) => {
				transaction.delete(journeyEvent.ref)
			})

			allJourneys.forEach((journey) => {
				transaction.delete(journey.ref)
			})

			allObjectives.forEach((objective) => {
				transaction.delete(objective.ref)
			})

			allParticipants.forEach((participant) => {
				transaction.delete(participant.ref)
			})

			allPersonas.forEach((persona) => {
				transaction.delete(persona.ref)
			})

			allProductInvites.forEach((productInvite) => {
				transaction.delete(productInvite.ref)
			})

			allResults.forEach((result) => {
				transaction.delete(result.ref)
			})

			allRetrospectiveItems.forEach((retrospectiveItem) => {
				transaction.delete(retrospectiveItem.ref)
			})

			allStoryMapStates.forEach((storyMapState) => {
				transaction.delete(storyMapState.ref)
			})

			allTasks.forEach((task) => {
				transaction.delete(task.ref)
			})

			allVersions.forEach((version) => {
				transaction.delete(version.ref)
			})
		})
	}),
})

export type AppRouter = typeof appRouter
