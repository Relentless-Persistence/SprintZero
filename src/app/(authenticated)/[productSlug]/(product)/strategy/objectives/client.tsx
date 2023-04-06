"use client"

import { Breadcrumb, Card, Input, Tabs } from "antd"
import { Timestamp, collection, doc, orderBy, query, setDoc, updateDoc, writeBatch } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type { FC } from "react"

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { BusinessOutcomeConverter } from "~/types/db/Products/BusinessOutcomes"
import { MarketLeaderConverter } from "~/types/db/Products/MarketLeaders"
import { PersonaConverter } from "~/types/db/Products/Personas"
import { PotentialRiskConverter } from "~/types/db/Products/PotentialRisks"
import { UserPriorityConverter } from "~/types/db/Products/UserPriorities"
import { db } from "~/utils/firebase"
import { trpc } from "~/utils/trpc"

import TextListEditor from "~/components/TextListEditor"
import TextareaCard from "../kickoff/TextareaCard"
import { CloseCircleFilled, CloseCircleOutlined } from "@ant-design/icons"
import TextListCard from "../kickoff/TextListCard"
import { ResultConverter } from "~/types/db/Products/Objectives/Results"
import { useDebounce } from "react-use"
import { ObjectiveConverter } from "~/types/db/Products/Objectives"

const ObjectivesClientPage: FC = () => {

	const { product } = useAppContext()
	const [currentObjectiveId, setCurrentObjectiveId] = useState<string | undefined>(undefined)

	const [objectives, , objectivesError] = useCollection(
		query(collection(product.ref, `Objectives`), orderBy(`name`, `asc`)).withConverter(ObjectiveConverter),
	)
	useErrorHandler(objectivesError)

	const hasSetInitialObjective = useRef(false)
	useEffect(() => {
		if (hasSetInitialObjective.current || !objectives) return
		if (objectives.docs.length > 0) setCurrentObjectiveId(objectives.docs[0]!.id)
		hasSetInitialObjective.current = true
	}, [objectives])

	const currentObjective = objectives?.docs.find((doc) => doc.id === currentObjectiveId)

	const [results, , resultsError] = useCollection(
		currentObjectiveId
			? query(
				collection(product.ref, `Objectives`, currentObjectiveId, `Results`),
				orderBy(`createdAt`, `asc`),
			).withConverter(ResultConverter)
			: undefined,
	)
	useErrorHandler(resultsError)

	const hasSetDefaultObjective = useRef(false)
	useEffect(() => {
		if (hasSetDefaultObjective.current || !objectives) return
		if (objectives.docs.length > 0) setCurrentObjectiveId(objectives.docs[0]!.id)
		hasSetDefaultObjective.current = true
	}, [objectives])

	const [statement, setStatement] = useState(``)
	const dbStatement = currentObjective?.data().statement
	useEffect(() => {
		if (!dbStatement) return
		setStatement(dbStatement)
	}, [dbStatement])
	useDebounce(
		async () => {
			if (!currentObjective || statement === dbStatement) return
			await updateDoc(doc(product.ref, `Objectives`, currentObjective.id).withConverter(ObjectiveConverter), {
				statement,
			})
		},
		500,
		[statement, dbStatement, currentObjective],
	)

	const [activeResultId, setActiveResultId] = useState<string | `new` | undefined>(undefined)



	// kickoff stuff
	const [editingSection, setEditingSection] = useState<
		| `okrHowMightWeStatement`
		| `okrTargetPersonas`
		| `okrJobToBeDone`
		| `okrKeyResults`
		| `okrBreakdownReasons`
		| `okrBlockersDependencies`
		| undefined
	>(undefined)

	const [okrTargetPersonas, , okrTargetPersonasError] = useCollection(
		query(collection(product.ref, `OkrTargetPersonas`), orderBy(`createdAt`, `asc`)).withConverter(PersonaConverter),
	)
	useErrorHandler(okrTargetPersonasError)

	const [okrJobToBeDone, , okrJobToBeDoneError] = useCollection(
		query(collection(product.ref, `BusinessOutcomes`), orderBy(`createdAt`, `asc`)).withConverter(
			BusinessOutcomeConverter,
		),
	)
	useErrorHandler(okrJobToBeDoneError)

	const [okrKeyResults, , okrKeyResultsError] = useCollection(
		query(collection(product.ref, `UserPriorities`), orderBy(`createdAt`, `asc`)).withConverter(UserPriorityConverter),
	)
	useErrorHandler(okrKeyResultsError)

	const [okrBreakdownReasons, , okrBreakdownReasonsError] = useCollection(
		query(collection(product.ref, `PotentialRisks`), orderBy(`createdAt`, `asc`)).withConverter(PotentialRiskConverter),
	)
	useErrorHandler(okrBreakdownReasonsError)

	const [okrBlockersDependencies, , okrBlockersDependenciesError] = useCollection(
		query(collection(product.ref, `MarketLeaders`), orderBy(`createdAt`, `asc`)).withConverter(MarketLeaderConverter),
	)
	useErrorHandler(okrBlockersDependenciesError)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="relative flex w-full flex-col gap-2 overflow-auto px-12 py-8">
				<Breadcrumb items={[{ title: `Strategy` }, { title: `Objectives` }, { title: currentObjective?.data().name }]} />
				<div className="leading-normal">
					<h1 className="text-4xl font-semibold">Objectives + key results</h1>
					<p className="text-base text-textSecondary">
						Define the measurable outcomes that will define success
					</p>
				</div>
				<Tabs
					tabPosition="top"
					activeKey={currentObjectiveId}
					onChange={(key) => {
						setCurrentObjectiveId(key)
						setStatement(objectives?.docs.find((objective) => objective.id === key)?.data().statement || ``)
					}}
					items={objectives?.docs.map((objective) => ({ key: objective.id, label: objective.data().name }))}
				/>

				{currentObjectiveId && (
					<Input
						prefix={<span className="font-medium">Objective:</span>}
						suffix={
							<CloseCircleOutlined />
						}
						value={statement}
						onChange={(e) => {
							if (!currentObjective) return
							setStatement(e.target.value)
						}}
					/>
				)}

				<Masonry
					breakpointCols={{ default: 3, 1700: 2, 1300: 2, 1000: 1 }}
					className="flex gap-8 mt-2"
					columnClassName="flex flex-col gap-5"
				>
					{/* <EditableTextCard
                    title="Problem Statement"
                    text={product.data().problemStatement}
                    isEditing={editingSection === `problemStatement`}
                    onEditStart={() => setEditingSection(`problemStatement`)}
                    onEditEnd={() => setEditingSection(undefined)}
                    onCommit={async (text) => {
                        await updateDoc(product.ref, {problemStatement: text})
                    }}
                /> */}

					<TextareaCard
						title="How Might We Statement"
						text={product.data().problemStatement}
						isEditing={editingSection === `okrHowMightWeStatement`}
						onEditStart={() => setEditingSection(`okrHowMightWeStatement`)}
						onEditEnd={() => setEditingSection(undefined)}
						onCommit={async (text) => {
							await updateDoc(product.ref, { problemStatement: text })
						}}
					/>

					<Card
						type="inner"
						title="Target Personas"
					>

						{['1.', '2.', '3.', '4.', '5.'].map((input, index) => (
							<Input className="mb-3"
								key={index}
								prefix={input}
								suffix={
									<CloseCircleOutlined />
								}
							/>
						))}
						{/* <TextListEditor textList={draftTextList} onChange={setDraftTextList} /> */}
					</Card>

					{/* <TextListCard
                    title="Personas"
                    textList={personas?.docs.map((doc) => ({ id: doc.id, text: doc.data().name })) ?? []}
                    isEditing={editingSection === `personas`}
                    onEditStart={() => setEditingSection(`personas`)}
                    onEditEnd={() => setEditingSection(undefined)}
                    onCommit={async (textList) => {
                        await Promise.all(
                            textList.map(async (item) => {
                                if (personas?.docs.some((doc) => doc.id === item.id)) {
                                    await updateDoc(doc(product.ref, `Personas`, item.id).withConverter(PersonaConverter), {
                                        name: item.text,
                                    })
                                } else {
                                    await setDoc(doc(product.ref, `Personas`, item.id).withConverter(PersonaConverter), {
                                        createdAt: Timestamp.now(),
                                        description: ``,
                                        name: item.text,
                                    })

                                    // Generate description asynchonously
                                    gpt
                                        .mutateAsync({
                                            prompt: `Below is a vision statement for an app I'm building:\n\n"${product.data().finalVision
                                                }"\n\nDescribe the user persona "${item.text}" in a paragraph.`,
                                        })
                                        .then(({ response }) => {
                                            const description = response?.replace(/^\\n+/, ``).replace(/\\n+$/, ``)
                                            updateDoc(doc(product.ref, `Personas`, item.id).withConverter(PersonaConverter), {
                                                description,
                                            }).catch(console.error)
                                        })
                                        .catch(console.error)
                                }
                            }),
                        )
                    }}
                /> */}

					<TextListCard
						title="Job To Be Done"
						textList={okrJobToBeDone?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
						isEditing={editingSection === `okrJobToBeDone`}
						onEditStart={() => setEditingSection(`okrJobToBeDone`)}
						onEditEnd={() => setEditingSection(undefined)}
						onCommit={async (textList) => {
							console.log('saving to db')
							await Promise.all(
								textList.map(async (item) => {
									if (okrJobToBeDone?.docs.some((doc) => doc.id === item.id)) {
										console.log('updating doc')
										await updateDoc(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
											text: item.text,
										}).catch(console.error)
									} else {
										console.log('setting doc')
										await setDoc(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
											createdAt: Timestamp.now(),
											text: item.text,
										}).catch(console.error)
									}
								}),
							)
						}}
					// onCommit={async (textList) => {
					//  console.log(textList)
					//  const batch = writeBatch(db)
					//  textList.forEach((item) => {
					//      batch.update(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
					//          text: item.text,
					//      })
					//  })
					//  await batch.commit()
					// }}
					/>

					<TextListCard
						title="Key Results"
						textList={okrKeyResults?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
						isEditing={editingSection === `okrKeyResults`}
						onEditStart={() => setEditingSection(`okrKeyResults`)}
						onEditEnd={() => setEditingSection(undefined)}
						onCommit={async (textList) => {
							const batch = writeBatch(db)
							textList.forEach((item) => {
								batch.update(doc(product.ref, `UserPriorities`, item.id).withConverter(UserPriorityConverter), {
									text: item.text,
								})
							})
							await batch.commit()
						}}
					/>

					<TextListCard
						title="Breakdown Reasons"
						textList={okrBreakdownReasons?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
						isEditing={editingSection === `okrBreakdownReasons`}
						onEditStart={() => setEditingSection(`okrBreakdownReasons`)}
						onEditEnd={() => setEditingSection(undefined)}
						onCommit={async (textList) => {
							const batch = writeBatch(db)
							textList.forEach((item) => {
								batch.update(doc(product.ref, `PotentialRisks`, item.id).withConverter(PotentialRiskConverter), {
									text: item.text,
								})
							})
							await batch.commit()
						}}
					/>

					<TextListCard
						title="Blockers/Dependencies"
						textList={okrBlockersDependencies?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
						isEditing={editingSection === `okrBlockersDependencies`}
						onEditStart={() => setEditingSection(`okrBlockersDependencies`)}
						onEditEnd={() => setEditingSection(undefined)}
						onCommit={async (textList) => {
							const batch = writeBatch(db)
							textList.forEach((item) => {
								batch.update(doc(product.ref, `MarketLeaders`, item.id).withConverter(MarketLeaderConverter), {
									text: item.text,
								})
							})
							await batch.commit()
						}}
					/>
				</Masonry>
			</div>
		</div>
	)
}

export default ObjectivesClientPage

