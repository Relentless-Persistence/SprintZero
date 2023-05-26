"use client"

import { CloseCircleOutlined, DeleteOutlined } from "@ant-design/icons"
import { Breadcrumb, Button, Card, Input, Select, Tabs } from "antd"
import { Timestamp, addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc } from "firebase/firestore"
import { useEffect, useRef, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type { SelectProps } from "antd";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import type { FC } from "react"
import type { Objective } from "~/types/db/Products/Objectives";
import type { Persona } from "~/types/db/Products/Personas";

import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { ObjectiveBreakdownReasonConverter, ObjectiveConverter, ObjectiveKeyResultConverter } from "~/types/db/Products/Objectives";
import { PersonaConverter } from "~/types/db/Products/Personas"

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
	const [addNewObjectiveBreakdownReason, setAddNewObjectiveBreakdownReason] = useState(false)
	const [newObjectiveBreakdownReason, setNewObjectiveBreakdownReason] = useState(``)

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
	};

	const [personas, , personasError] = useCollection(collection(product.ref, `Personas`).withConverter(PersonaConverter))
	useErrorHandler(personasError)

	const targetPersonaOptions: SelectProps['options'] = personas?.docs
		.filter((persona): persona is QueryDocumentSnapshot<Persona> => persona.exists())
		.map((persona) => ({ label: persona.data().name, value: persona.id }))

	const [keyResults, , keyResultsError] = useCollection(
		objectives && currentObjective ?
			query(collection(currentObjective.ref, `KeyResults`), orderBy(`createdAt`, `asc`)).withConverter(ObjectiveKeyResultConverter)
			: undefined,
	)
	useErrorHandler(keyResultsError)

	const [breakdownReasons, , breakdownReasonsError] = useCollection(
		objectives && currentObjective ?
			query(collection(currentObjective.ref, `BreakdownReasons`), orderBy(`createdAt`, `asc`)).withConverter(ObjectiveBreakdownReasonConverter)
			: undefined,
	)
	useErrorHandler(breakdownReasonsError)

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
					className="centered-tab"
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
					onBlur={() => {
						updateDoc(currentObjective!.ref, { statement: objectiveStatement })
							.catch((error) => {
								console.error(error);
							});
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
							onBlur={() => {
								updateDoc(currentObjective!.ref, { howMightWeStatement })
									.catch((error) => {
										console.error(error);
									});
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
							onChange={() => handleTargetPersonaChange}
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
								onBlur={() => {
									updateDoc(currentObjective!.ref, { "jobToBeDone.when": jobToBeDoneWhen })
										.catch((error) => {
											console.error(error);
										});
								}}
							/>
							<Input
								prefix="I want to:"
								value={jobToBeDoneIWantTo}
								onChange={(e) => setJobToBeDoneIWantTo(e.target.value)}
								onBlur={() => {
									updateDoc(currentObjective!.ref, { "jobToBeDone.iWantTo": jobToBeDoneIWantTo })
										.catch((error) => {
											console.error(error);
										});
								}}
							/>
							<Input
								prefix="So I can:"
								value={jobToBeDoneSoICan}
								onChange={(e) => setJobToBeDoneSoICan(e.target.value)}
								onBlur={() => {
									updateDoc(currentObjective!.ref, { "jobToBeDone.soICan": jobToBeDoneSoICan })
										.catch((error) => {
											console.error(error);
										});
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
										deleteDoc(doc(currentObjective!.ref, `KeyResults`, keyResult.id))
											.catch(error => {
												console.error(error);
											});
									}} />
								}

								value={keyResult.text}
								onChange={(e) => {
									if (keyResult.text === ``) return
									updateDoc(doc(currentObjective!.ref, `KeyResults`, keyResult.id), {
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
								addDoc(collection(currentObjective!.ref, `KeyResults`), {
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
								addDoc(collection(currentObjective!.ref, `KeyResults`), {
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
							if (keyResults?.empty) return
							setAddNewObjectiveKeyResult(true)
						}}
						>Add</Button>
					</Card>

					<Card
						type="inner"
						title="Breakdown Reasons"
					>

						{breakdownReasons?.docs.map(doc => ({ id: doc.id, ...doc.data() })).map((reason, index) => (
							<Input className="mb-3"
								key={index}
								prefix={`${index + 1}.`}
								suffix={
									<DeleteOutlined onClick={() => {
										if (!reason.id) return;
										deleteDoc(doc(currentObjective!.ref, `BreakdownReasons`, reason.id))
											.catch(error => {
												console.error(error);
											});
									}} />
								}

								value={reason.text}
								onChange={(e) => {
									if (reason.text === ``) return
									updateDoc(doc(currentObjective!.ref, `BreakdownReasons`, reason.id), {
										text: e.target.value
									})
										.catch(error => {
											console.error(error)
										})
								}}
							/>
						))}
						{breakdownReasons && breakdownReasons.empty && <Input className="mb-3"
							prefix={`${breakdownReasons.size + 1}.`}
							suffix={
								<CloseCircleOutlined onClick={() => {
									setNewObjectiveBreakdownReason(``)
									setAddNewObjectiveBreakdownReason(false)
								}} />
							}
							value={newObjectiveBreakdownReason}
							onChange={(e) => setNewObjectiveBreakdownReason(e.target.value)}
							onBlur={() => {
								if (newObjectiveBreakdownReason === ``) return;
								setAddNewObjectiveBreakdownReason(false)
								addDoc(collection(currentObjective!.ref, `BreakdownReasons`), {
									text: newObjectiveBreakdownReason,
									createdAt: Timestamp.now(),
								})
									.then(() => {
										setNewObjectiveBreakdownReason(``)
									})
									.catch(error => {
										console.error(error)
									})
							}}
						/>}
						{breakdownReasons && addNewObjectiveBreakdownReason && <Input className="mb-3"
							prefix={`${breakdownReasons.size + 1}.`}
							suffix={
								<DeleteOutlined onClick={() => {
									setNewObjectiveBreakdownReason(``)
									setAddNewObjectiveBreakdownReason(false)
								}} />
							}
							value={newObjectiveBreakdownReason}
							onChange={(e) => setNewObjectiveBreakdownReason(e.target.value)}
							onBlur={() => {
								if (newObjectiveBreakdownReason === ``) return;
								setAddNewObjectiveBreakdownReason(false)
								addDoc(collection(currentObjective!.ref, `BreakdownReasons`), {
									text: newObjectiveBreakdownReason,
									createdAt: Timestamp.now(),
								})
									.then(() => {
										setNewObjectiveBreakdownReason(``)
									})
									.catch(error => {
										console.error(error)
									})
							}}
						/>}
						<Button block className="mt-1" onClick={() => {
							if (breakdownReasons?.empty) return
							setAddNewObjectiveBreakdownReason(true)
						}}
						>Add</Button>
					</Card>
				</Masonry>)
				}
			</div>
		</div>
	)
}

export default ObjectivesClientPage
