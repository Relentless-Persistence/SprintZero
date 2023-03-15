import {FieldValue, Timestamp} from "firebase-admin/firestore"
import {Configuration, OpenAIApi} from "openai"
import {z} from "zod"

import type {User} from "~/types/db/Users"

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
			dbAdmin.collectionGroup(`Comments`).withConverter(genAdminConverter(OldCommentSchema)).get(),
			dbAdmin.collectionGroup(`Histories`).withConverter(genAdminConverter(OldHistorySchema)).get(),
			dbAdmin.collection(`Insights`).withConverter(genAdminConverter(OldInsightSchema)).get(),
			dbAdmin.collectionGroup(`JourneyEvents`).withConverter(genAdminConverter(OldJourneyEventSchema)).get(),
			dbAdmin.collection(`Journeys`).withConverter(genAdminConverter(OldJourneySchema)).get(),
			dbAdmin.collection(`Objectives`).withConverter(genAdminConverter(OldObjectiveSchema)).get(),
			dbAdmin.collection(`Participants`).withConverter(genAdminConverter(OldParticipantSchema)).get(),
			dbAdmin.collection(`Personas`).withConverter(genAdminConverter(OldPersonaSchema)).get(),
			dbAdmin.collection(`ProductInvites`).withConverter(genAdminConverter(OldProductInviteSchema)).get(),
			dbAdmin.collection(`Products`).withConverter(genAdminConverter(OldProductSchema)).get(),
			dbAdmin.collectionGroup(`Results`).withConverter(genAdminConverter(OldResultSchema)).get(),
			dbAdmin.collection(`RetrospectiveItems`).withConverter(genAdminConverter(OldRetrospectiveItemSchema)).get(),
			dbAdmin.collection(`StoryMapStates`).withConverter(genAdminConverter(OldStoryMapStateSchema)).get(),
			dbAdmin.collection(`Tasks`).withConverter(genAdminConverter(OldTaskSchema)).get(),
			dbAdmin.collection(`Users`).withConverter(genAdminConverter(OldUserSchema)).get(),
			dbAdmin.collectionGroup(`Versions`).withConverter(genAdminConverter(OldVersionSchema)).get(),
		])

		for (const product of allProducts.docs) {
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

			await Promise.all([
				// Update products
				dbAdmin
					.collection(`Products`)
					.doc(product.id)
					.withConverter(genAdminConverter(ProductSchema))
					.set({
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
					}),

				// Update journeys
				...journeys.map(async (journey) => {
					const journeyEvents = allJourneyEvents.docs.filter((doc) => doc.ref.parent.parent?.id === journey.id)
					await Promise.all([
						// Journeys
						dbAdmin
							.collection(`Products`)
							.doc(product.id)
							.collection(`Journeys`)
							.doc(journey.id)
							.withConverter(genAdminConverter(JourneySchema))
							.set({
								duration: journey.data().duration,
								durationUnit: journey.data().durationUnit,
								name: journey.data().name,
							}),

						// Journey events
						...journeyEvents.map(async (journeyEvent) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Journeys`)
								.doc(journey.id)
								.collection(`Events`)
								.doc(journeyEvent.id)
								.withConverter(genAdminConverter(EventSchema))
								.set({
									description: journeyEvent.data().description,
									emotion: journeyEvent.data().emotion,
									emotionLevel: journeyEvent.data().emotionLevel,
									end: journeyEvent.data().end,
									start: journeyEvent.data().start,
									subject: journeyEvent.data().subject,
									personaIds: journeyEvent.data().personaIds,
								})
						}),
					])
				}),

				// Update objectives
				...objectives.map(async (objective) => {
					const results = allResults.docs.filter((doc) => doc.ref.parent.parent?.id === objective.id)
					await Promise.all([
						// Objective
						dbAdmin
							.collection(`Products`)
							.doc(product.id)
							.collection(`Objectives`)
							.doc(objective.id)
							.withConverter(genAdminConverter(ObjectiveSchema))
							.set({
								name: objective.data().name,
								statement: objective.data().statement,
							}),
						// Results
						...results.map(async (result) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Objectives`)
								.doc(objective.id)
								.collection(`Results`)
								.doc(result.id)
								.withConverter(genAdminConverter(ResultSchema))
								.set({
									createdAt: result.data().createdAt,
									text: result.data().text,
								})
						}),
					])
				}),

				// Update personas
				...personas.map(async (persona) => {
					// Persona
					await Promise.all([
						dbAdmin
							.collection(`Products`)
							.doc(product.id)
							.collection(`Personas`)
							.doc(persona.id)
							.withConverter(genAdminConverter(PersonaSchema))
							.set({
								createdAt: persona.data().createdAt,
								description: persona.data().description,
								name: persona.data().name,
							}),
						// Persona changes
						...persona.data().changes.map(async (change) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`Changes`)
								.doc()
								.withConverter(genAdminConverter(ChangeSchema))
								.set({
									text: change.text,
								})
						}),
						// Persona day in the life
						...persona.data().dayInTheLife.map(async (dayInTheLife) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`DaysInTheLife`)
								.doc()
								.withConverter(genAdminConverter(DayInTheLifeSchema))
								.set({
									text: dayInTheLife.text,
								})
						}),
						...persona.data().frustrations.map(async (frustration) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`Frustrations`)
								.doc()
								.withConverter(genAdminConverter(FrustrationSchema))
								.set({
									text: frustration.text,
								})
						}),
						...persona.data().goals.map(async (goal) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`Goals`)
								.doc()
								.withConverter(genAdminConverter(GoalSchema))
								.set({
									text: goal.text,
								})
						}),
						...persona.data().interactions.map(async (interaction) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`Interactions`)
								.doc()
								.withConverter(genAdminConverter(InteractionSchema))
								.set({
									text: interaction.text,
								})
						}),
						...persona.data().tasks.map(async (task) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`PersonaTasks`)
								.doc()
								.withConverter(genAdminConverter(PersonaTaskSchema))
								.set({
									text: task.text,
								})
						}),
						...persona.data().priorities.map(async (priority) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`Priorities`)
								.doc()
								.withConverter(genAdminConverter(PrioritySchema))
								.set({
									text: priority.text,
								})
						}),
						...persona.data().responsibilities.map(async (responsibility) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`Personas`)
								.doc(persona.id)
								.collection(`Responsibilities`)
								.doc()
								.withConverter(genAdminConverter(ResponsibilitySchema))
								.set({
									text: responsibility.text,
								})
						}),
					])
				}),

				...histories.map(async (history) => {
					await Promise.all([
						dbAdmin
							.collection(`Products`)
							.doc(product.id)
							.collection(`StoryMapHistories`)
							.doc(history.id)
							.withConverter(genAdminConverter(StoryMapHistorySchema))
							.set({
								future: history.data().future,
								timestamp: history.data().timestamp,
							}),
						...Object.keys(history.data().items).map(async (itemId) => {
							const item = history.data().items[itemId]!
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`StoryMapHistories`)
								.doc(history.id)
								.collection(`HistoryItems`)
								.doc(itemId)
								.withConverter(genAdminConverter(HistoryItemSchema))
								.set({
									deleted: false,
									effort: `effort` in item ? item.effort : null,
									userValue: `userValue` in item ? item.userValue : null,
									parentId: `parentId` in item ? item.parentId : null,
									versionId: `versionId` in item ? item.versionId : null,
								})
						}),
					])
				}),

				...Object.keys(storyMapState.data().items).map(async (itemId) => {
					const item = storyMapState.data().items[itemId]!
					const comments = allComments.docs.filter((comment) => comment.data().parentId === itemId)
					await Promise.all([
						dbAdmin
							.collection(`Products`)
							.doc(product.id)
							.collection(`StoryMapItems`)
							.doc(itemId)
							.withConverter(genAdminConverter(StoryMapItemSchema))
							.set({
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
							}),
						...comments.map(async (comment) => {
							await dbAdmin
								.collection(`Products`)
								.doc(product.id)
								.collection(`StoryMapItems`)
								.doc(itemId)
								.collection(`Comments`)
								.doc(comment.id)
								.withConverter(genAdminConverter(CommentSchema))
								.set({
									createdAt: comment.data().createdAt,
									text: comment.data().text,
									type: comment.data().type,
									authorId: comment.data().authorId,
								})
						}),
					])
				}),

				...product.data().businessOutcomes.map(async (businessOutcome) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`BusinessOutcomes`)
						.doc()
						.withConverter(genAdminConverter(BusinessOutcomeSchema))
						.set({
							createdAt: Timestamp.now(),
							text: businessOutcome.text,
						})
				}),

				...participants.map(async (participant) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`DialogueParticipants`)
						.doc(participant.id)
						.withConverter(genAdminConverter(DialogueParticipantSchema))
						.set({
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
						})
				}),

				...(product.data().features ?? []).map(async (feature) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`Features`)
						.doc()
						.withConverter(genAdminConverter(FeatureSchema))
						.set({
							text: feature.text,
						})
				}),

				...Object.keys(product.data().huddles).map(async (huddleId) => {
					const huddle = product.data().huddles[huddleId]!
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`Huddles`)
						.doc(huddleId)
						.withConverter(genAdminConverter(HuddleSchema))
						.set({
							updatedAt: huddle.updatedAt,
							blockerStoryIds: huddle.blockerStoryIds,
							todayStoryIds: huddle.todayStoryIds,
							yesterdayStoryIds: huddle.yesterdayStoryIds,
						})
				}),

				...insights.map(async (insight) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`Insights`)
						.doc(insight.id)
						.withConverter(genAdminConverter(InsightSchema))
						.set({
							status: insight.data().status,
							text: insight.data().text,
							title: insight.data().title,
						})
				}),

				...productInvites.map(async (productInvite) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`Invites`)
						.doc(productInvite.id)
						.withConverter(genAdminConverter(InviteSchema))
						.set({
							email: productInvite.data().email,
							id: productInvite.id,
							userType: `editor`,
						})
				}),

				...product.data().marketLeaders.map(async (marketLeader) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`MarketLeaders`)
						.doc()
						.withConverter(genAdminConverter(MarketLeaderSchema))
						.set({
							createdAt: Timestamp.now(),
							text: marketLeader.text,
						})
				}),

				...Object.keys(product.data().members).map(async (memberId) => {
					const member = product.data().members[memberId]!
					const user = allUsers.docs.find((user) => user.id === memberId)!
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`Members`)
						.doc(memberId)
						.withConverter(genAdminConverter(MemberSchema))
						.set({
							avatar: user.data().avatar,
							name: user.data().name,
							type: member.type,
							id: memberId,
						})
				}),

				...product.data().potentialRisks.map(async (potentialRisk) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`PotentialRisks`)
						.doc()
						.withConverter(genAdminConverter(PotentialRiskSchema))
						.set({
							createdAt: Timestamp.now(),
							text: potentialRisk.text,
						})
				}),

				...retrospectiveItems.map(async (retrospectiveItem) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`RetrospectiveItems`)
						.doc(retrospectiveItem.id)
						.withConverter(genAdminConverter(RetrospectiveItemSchema))
						.set({
							archived: retrospectiveItem.data().archived,
							createdAt: retrospectiveItem.data().createdAt,
							description: retrospectiveItem.data().description,
							proposedActions: retrospectiveItem.data().proposedActions,
							title: retrospectiveItem.data().title,
							type: retrospectiveItem.data().type,
							userId: retrospectiveItem.data().userId,
						})
				}),

				...tasks.map(async (task) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`Tasks`)
						.doc(task.id)
						.withConverter(genAdminConverter(TaskSchema))
						.set({
							board: task.data().board,
							dueDate: task.data().dueDate,
							notes: task.data().notes,
							status: task.data().status,
							subtasks: task.data().subtasks,
							title: task.data().title,
							assigneeIds: task.data().assigneeIds,
						})
				}),

				...product.data().userPriorities.map(async (userPriority) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`UserPriorities`)
						.doc()
						.withConverter(genAdminConverter(UserPrioritySchema))
						.set({
							createdAt: Timestamp.now(),
							text: userPriority.text,
						})
				}),

				...versions.map(async (version) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`Versions`)
						.doc(version.id)
						.withConverter(genAdminConverter(VersionSchema))
						.set({
							deleted: false,
							name: version.data().name,
						})
				}),

				...product.data().updates.map(async (update) => {
					await dbAdmin
						.collection(`Products`)
						.doc(product.id)
						.collection(`VisionUpdates`)
						.doc(update.id)
						.withConverter(genAdminConverter(VisionUpdateSchema))
						.set({
							text: update.text,
							timestamp: update.timestamp,
							userId: update.userId,
						})
				}),
			])
		}

		await Promise.all([
			...allUsers.docs.map(async (user) => {
				await dbAdmin.doc(user.ref.path).update({
					// @ts-ignore -- Legacy field
					avatar: FieldValue.delete(),
					// @ts-ignore -- Legacy field
					name: FieldValue.delete(),
					preferredMusicClient: `appleMusic`,
				} satisfies User)
			}),

			...allComments.docs.map(async (comment) => {
				await comment.ref.delete()
			}),

			...allHistories.docs.map(async (history) => {
				await history.ref.delete()
			}),

			...allInsights.docs.map(async (insight) => {
				await insight.ref.delete()
			}),

			...allJourneyEvents.docs.map(async (journeyEvent) => {
				await journeyEvent.ref.delete()
			}),

			...allJourneys.docs.map(async (journey) => {
				await journey.ref.delete()
			}),

			...allObjectives.docs.map(async (objective) => {
				await objective.ref.delete()
			}),

			...allParticipants.docs.map(async (participant) => {
				await participant.ref.delete()
			}),

			...allPersonas.docs.map(async (persona) => {
				await persona.ref.delete()
			}),

			...allProductInvites.docs.map(async (productInvite) => {
				await productInvite.ref.delete()
			}),

			...allResults.docs.map(async (result) => {
				await result.ref.delete()
			}),

			...allRetrospectiveItems.docs.map(async (retrospectiveItem) => {
				await retrospectiveItem.ref.delete()
			}),

			...allStoryMapStates.docs.map(async (storyMapState) => {
				await storyMapState.ref.delete()
			}),

			...allTasks.docs.map(async (task) => {
				await task.ref.delete()
			}),

			...allVersions.docs.map(async (version) => {
				await version.ref.delete()
			}),
		])
	}),
})

export type AppRouter = typeof appRouter
