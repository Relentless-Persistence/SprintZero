"use client"

import { CloseCircleFilled, CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons"
import { Breadcrumb, Button, Card, Input, Select, Tabs } from "antd"
import { Timestamp, addDoc, collection, deleteDoc, doc, orderBy, query, setDoc, updateDoc, writeBatch } from "firebase/firestore"
import { current } from "immer"
import { useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"
import { useDebounce } from "react-use"

import type { SelectProps } from "antd";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import type { FC } from "react"
import type { Objective } from "~/types/db/Products/Objectives";
import type { Persona } from "~/types/db/Products/Personas";

import TextareaCard from "../kickoff/TextareaCard"
import TextListCard from "../kickoff/TextListCard"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import TextListEditor from "~/components/TextListEditor"
import { BusinessOutcomeConverter } from "~/types/db/Products/BusinessOutcomes"
import { MarketLeaderConverter } from "~/types/db/Products/MarketLeaders"
import { ObjectiveConverter, ObjectiveKeyResultConverter } from "~/types/db/Products/Objectives";
import { ResultConverter } from "~/types/db/Products/Objectives/Results"
import { PersonaConverter } from "~/types/db/Products/Personas"
import { PotentialRiskConverter } from "~/types/db/Products/PotentialRisks"
import { UserPriorityConverter } from "~/types/db/Products/UserPriorities"
import { db } from "~/utils/firebase"
import { trpc } from "~/utils/trpc"


const ObjectivesClientPage: FC = () => {
	const { product } = useAppContext()
	const [objectives, , objectivesError] = useCollection(query(collection(product.ref, `Objectives`)).withConverter(ObjectiveConverter))
	useErrorHandler(objectivesError)

	const [currentObjective, setCurrentObjective] = useState<QueryDocumentSnapshot<Objective>>()
	const [currentObjectiveId, setCurrentObjectiveId] = useState(``)
	const [howMightWeStatement, setHowMightWeStatement] = useState<string>()
	const [objectiveStatement, setObjectiveStatement] = useState<string>()
	const [targetPersona, setTargetPersona] = useState<string[] | undefined>()
	const [jobToBeDoneWhen, setJobToBeDoneWhen] = useState<string>();
	const [jobToBeDoneIWantTo, setJobToBeDoneIWantTo] = useState<string>();
	const [jobToBeDoneSoICan, setJobToBeDoneSoICan] = useState<string>();
	const [addNewObjectiveKeyResult, setAddNewObjectiveKeyResult] = useState(false)
	const [newObjectiveKeyResult, setNewObjectiveKeyResult] = useState(``)

	const hasSetDefaultObjective = useRef(false)
	useEffect(() => {
		if (objectives?.docs && !hasSetDefaultObjective.current) {
			const currentObjective = objectives.docs.find(obj => obj.data().name === `One`);
			if (currentObjective) {
				setCurrentObjective(currentObjective)
				setCurrentObjectiveId(currentObjective.id)
				setHowMightWeStatement(currentObjective.data().howMightWeStatement)
				setObjectiveStatement(currentObjective.data().statement)
				setTargetPersona(currentObjective.data().targetPersona)
				setJobToBeDoneWhen(currentObjective.data().jobToBeDone?.when)
				setJobToBeDoneIWantTo(currentObjective.data().jobToBeDone?.iWantTo)
				setJobToBeDoneSoICan(currentObjective.data().jobToBeDone?.soICan)
				hasSetDefaultObjective.current = true
			}
		}
		else if (objectives?.docs) {
			const currentObjective = objectives.docs.find(obj => obj.id === currentObjectiveId);
			if (currentObjective) {
				setCurrentObjective(currentObjective)
				setCurrentObjectiveId(currentObjective.id)
				setHowMightWeStatement(currentObjective.data().howMightWeStatement)
				setObjectiveStatement(currentObjective.data().statement)
				setTargetPersona(currentObjective.data().targetPersona)
				setJobToBeDoneWhen(currentObjective.data().jobToBeDone?.when)
				setJobToBeDoneIWantTo(currentObjective.data().jobToBeDone?.iWantTo)
				setJobToBeDoneSoICan(currentObjective.data().jobToBeDone?.soICan)
				hasSetDefaultObjective.current = true
			}
		}

	}, [objectives, currentObjectiveId])

	const handleTargetPersonaChange = async (value: string[]) => {
		setTargetPersona(value);
		await updateDoc(currentObjective!.ref, { targetPersona: value })
		// await updateItem(product, storyMapItems, versions, story.id, {
		// 	peopleIds: value as WithFieldValue<string[] | undefined>,
		// })
	};

	const [personas, , personasError] = useCollection(collection(product.ref, `Personas`).withConverter(PersonaConverter))
	useErrorHandler(personasError)

	const targetPersonaOptions: SelectProps['options'] = personas?.docs
		.filter((persona): persona is QueryDocumentSnapshot<Persona> => persona.exists())
		.map((persona) => ({ label: persona.data().name, value: persona.id }))


	const [results, , resultsError] = useCollection(
		currentObjective?.id
			? query(
				collection(product.ref, `Objectives`, currentObjective.id, `Results`),
				orderBy(`createdAt`, `asc`),
			).withConverter(ResultConverter)
			: undefined,
	)
	useErrorHandler(resultsError)

	const [statement, setStatement] = useState(currentObjective?.data().statement ?? ``)
	//const dbStatement = currentObjective?.data().statement
	// useEffect(() => {
	// 	// if (!dbStatement) return
	// 	// setStatement(dbStatement)
	// }, [dbStatement])
	// useDebounce(
	// 	async () => {
	// 		if (!currentObjective || statement === dbStatement) return
	// 		await updateDoc(doc(product.ref, `Objectives`, currentObjective.id).withConverter(ObjectiveConverter), {
	// 			statement,
	// 		})
	// 	},
	// 	500,
	// 	[statement, dbStatement, currentObjective],
	// )

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

	const [TargetPersonas, , TargetPersonasError] = useCollection(
		objectives && currentObjective ?
			query(collection(currentObjective.ref, `TargetPersonas`), orderBy(`createdAt`, `asc`))
			: undefined,
	)
	useErrorHandler(TargetPersonasError)

	const [JobToBeDones, , JobToBeDonesError] = useCollection(
		objectives && currentObjective ?
			query(collection(currentObjective.ref, `JobToBeDones`), orderBy(`createdAt`, `asc`))
			: undefined,
	)
	useErrorHandler(JobToBeDonesError)

	const [businessOutcomes, , businessOutcomesError] = useCollection(
		query(collection(product.ref, `BusinessOutcomes`), orderBy(`createdAt`, `asc`)).withConverter(
			BusinessOutcomeConverter,
		),
	)

	const [keyResults, , keyResultsError] = useCollection(
		objectives && currentObjective ?
			query(collection(currentObjective.ref, `KeyResults`), orderBy(`createdAt`, `asc`)).withConverter(ObjectiveKeyResultConverter)
			: undefined,
	)
	useErrorHandler(keyResultsError)

	const [BreakdownReasons, , BreakdownReasonsError] = useCollection(
		objectives && currentObjective ?
			query(collection(currentObjective.ref, `BreakdownReasons`), orderBy(`createdAt`, `asc`))
			: undefined,
	)
	useErrorHandler(BreakdownReasonsError)

	const order = [`One`, `Two`, `Three`, `Four`, `Five`, `Six`];

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
					}}
					items={objectives?.docs
						.map((objective) => ({ key: objective.id, label: objective.data().name }))
						.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))}
				/>


				<Input
					prefix={<span className="font-medium">Objective:</span>}
					suffix={
						<CloseCircleOutlined />
					}
					value={objectiveStatement}
					onChange={(e) => {
						setObjectiveStatement(e.target.value)
					}}
					onBlur={async () => {
						await updateDoc(currentObjective.ref, { statement: objectiveStatement })
					}}
				/>



				{objectives && objectives.docs.length > 0 && (<Masonry
					breakpointCols={{ default: 3, 1700: 2, 1300: 2, 1000: 1 }}
					className="flex gap-8 mt-2"
					columnClassName="flex flex-col gap-5"
				>
					<Card
						type="inner"
						title="How Might We Statement"

					>
						<Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }}
							value={howMightWeStatement}
							onChange={(e) => setHowMightWeStatement(e.target.value)}
							onBlur={async () => {
								await updateDoc(currentObjective.ref, { howMightWeStatement })
							}}
						/>
					</Card>

					<Card
						type="inner"
						title="Target Persona"

					>
						<Select
							showSearch
							optionFilterProp="children"
							onChange={handleTargetPersonaChange}
							//name="peopleIds"
							mode="multiple"
							options={targetPersonaOptions}
							allowClear
							style={{ width: `430px` }}
							value={targetPersona}
						/>
					</Card>

					<Card title="Job To Be Done">
						<div className="flex flex-col gap-3">
							<Input
								prefix="When:"
								value={jobToBeDoneWhen}
								onChange={(e) => setJobToBeDoneWhen(e.target.value)}
								onBlur={async () => {
									await updateDoc(currentObjective.ref, { "jobToBeDone.when": jobToBeDoneWhen })
								}}
							/>
							<Input
								prefix="I want to:"
								value={jobToBeDoneIWantTo}
								onChange={(e) => setJobToBeDoneIWantTo(e.target.value)}
								onBlur={async () => {
									await updateDoc(currentObjective.ref, { "jobToBeDone.iWantTo": jobToBeDoneIWantTo })
								}}
							/>
							<Input
								prefix="So I can:"
								value={jobToBeDoneSoICan}
								onChange={(e) => setJobToBeDoneSoICan(e.target.value)}
								onBlur={async () => {
									await updateDoc(currentObjective.ref, { "jobToBeDone.soICan": jobToBeDoneSoICan })
								}}
							/>
						</div>
					</Card>

					<Card
						type="inner"
						title="Key Results"
					>

						{keyResults?.docs.map(doc => ({ id: doc.id, ...doc.data() })).map((keyResult, index) => (
							<Input className="mb-3"
								key={index}
								prefix={`${index + 1}.`}
								suffix={
									<DeleteOutlined onClick={() => {
										if (!keyResult.id) return;
										deleteDoc(doc(currentObjective.ref, `KeyResults`, keyResult.id))
											.catch(error => {
												console.error(error);
											});
									}} />
								}

								value={keyResult.text}
								onChange={(e) => {
									if (keyResult.text === ``) return
									updateDoc(doc(currentObjective.ref, `KeyResults`, keyResult.id), {
										text: e.target.value
									})
										.catch(error => {
											console.error(error)
										})
								}}
							/>
						))}
						{keyResults && keyResults.empty && <Input className="mb-3"
							prefix={`${keyResults.size + 1}.`}
							suffix={
								<CloseCircleOutlined onClick={() => {
									setNewObjectiveKeyResult(``)
									setAddNewObjectiveKeyResult(false)
								}} />
							}
							value={newObjectiveKeyResult}
							onChange={(e) => setNewObjectiveKeyResult(e.target.value)}
							onBlur={() => {
								if (newObjectiveKeyResult === ``) return;
								setAddNewObjectiveKeyResult(false)
								addDoc(collection(currentObjective.ref, `KeyResults`), {
									text: newObjectiveKeyResult,
									createdAt: Timestamp.now(),
								})
									.then(() => {
										setNewObjectiveKeyResult(``)
									})
									.catch(error => {
										console.error(error)
									})
							}}
						/>}
						{keyResults && addNewObjectiveKeyResult && <Input className="mb-3"
							prefix={`${keyResults.size + 1}.`}
							suffix={
								<DeleteOutlined onClick={() => {
									setNewObjectiveKeyResult(``)
									setAddNewObjectiveKeyResult(false)
								}} />
							}
							value={newObjectiveKeyResult}
							onChange={(e) => setNewObjectiveKeyResult(e.target.value)}
							onBlur={() => {
								if (newObjectiveKeyResult === ``) return;
								setAddNewObjectiveKeyResult(false)
								addDoc(collection(currentObjective.ref, `KeyResults`), {
									text: newObjectiveKeyResult,
									createdAt: Timestamp.now(),
								})
									.then(() => {
										setNewObjectiveKeyResult(``)
									})
									.catch(error => {
										console.error(error)
									})
							}}
						/>}
						<Button block className="mt-1" onClick={() => {
							if (businessOutcomes?.empty) return
							setAddNewObjectiveKeyResult(true)
						}}
						>Add</Button>
					</Card>

					{/* <TextareaCard
						title="How Might We Statement"
						text={currentObjective?.data().howMightWeStatement}
						isEditing={editingSection === `okrHowMightWeStatement`}
						onEditStart={() => setEditingSection(`okrHowMightWeStatement`)}
						onEditEnd={() => setEditingSection(undefined)}
						onCommit={async (text) => {
							currentObjective && await updateDoc(currentObjective.ref, { howMightWeStatement: text })
						}}
					/> */}

					{/* <Card
						type="inner"
						title="Target Personas"
					>

						{[`1.`, `2.`, `3.`, `4.`, `5.`].map((input, index) => (
							<Input className="mb-3"
								key={index}
								prefix={input}
								suffix={
									<CloseCircleOutlined />
								}
							/>
						))}
					</Card> */}

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

					{/* <TextListCard
						title="Job To Be Done"
						textList={okrJobToBeDone?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
						isEditing={editingSection === `okrJobToBeDone`}
						onEditStart={() => setEditingSection(`okrJobToBeDone`)}
						onEditEnd={() => setEditingSection(undefined)}
						onCommit={async (textList) => {
							//console.log(`saving to db`)
							await Promise.all(
								textList.map(async (item) => {
									if (okrJobToBeDone?.docs.some((doc) => doc.id === item.id)) {
										//console.log(`updating doc`)
										await updateDoc(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
											text: item.text,
										}).catch(console.error)
									} else {
										//console.log(`setting doc`)
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
					/> */}

					{/* <TextListCard
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
					/> */}
				</Masonry>)
				}
			</div>
		</div>
	)
}

export default ObjectivesClientPage
