"use client"

import { CloseCircleOutlined } from "@ant-design/icons"
import { Breadcrumb, Card, Input } from "antd"
import { Timestamp, addDoc, collection, doc, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type { FC } from "react"
// import type { Persona } from "~/types/db/Products/Personas"

import EditableTextCard from "./EditableTextCard"
import EditableTextListCard from "./EditableTextListCard"
import TextareaCard from "./TextareaCard"
import TextListCard from "./TextListCard"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import TextListEditor from "~/components/TextListEditor"
import { BusinessOutcomeConverter } from "~/types/db/Products/BusinessOutcomes"
import { MarketLeaderConverter } from "~/types/db/Products/MarketLeaders"
import { PersonaConverter } from "~/types/db/Products/Personas";
import { PotentialRiskConverter } from "~/types/db/Products/PotentialRisks"
import { UserPriorityConverter } from "~/types/db/Products/UserPriorities"
import { db } from "~/utils/firebase"
import { trpc } from "~/utils/trpc"

interface MyPersona {
	id?: string;
	name: string;
	description?: string;
	createdAt?: Timestamp;
}

const KickoffClientPage: FC = () => {
	const { product } = useAppContext()
	const [editingSection, setEditingSection] = useState<
		| `problemStatement`
		| `personas`
		| `businessOutcomes`
		| `userPriorities`
		| `potentialRisks`
		| `marketLeaders`
		| undefined
	>(undefined)

	const [personaList, setPersonaList] = useState<MyPersona[]>([])

	const [personas, , personasError] = useCollection(
		query(collection(product.ref, `Personas`), orderBy(`createdAt`, `asc`)).withConverter(PersonaConverter),
	)
	useErrorHandler(personasError)

	useEffect(() => {
		const emptyPersona: MyPersona = {
			createdAt: Timestamp.now(),
			description: ``,
			name: ``,
		};
		const emptyPersonaArray: MyPersona[] = Array.from({ length: 5 }, () => emptyPersona);

		if (personas && personas.empty) {
			setPersonaList(emptyPersonaArray)
		} else if (personas) {
			const newPersonas = personas.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			const personaList = newPersonas.length >= 5 ? newPersonas : [...newPersonas, ...Array.from({ length: 5 - newPersonas.length }, () => emptyPersona)];
			setPersonaList(personaList);
		}
	}, [personas])

	const [businessOutcomes, , businessOutcomesError] = useCollection(
		query(collection(product.ref, `BusinessOutcomes`), orderBy(`createdAt`, `asc`)).withConverter(
			BusinessOutcomeConverter,
		),
	)
	useErrorHandler(businessOutcomesError)

	const [userPriorities, , userPrioritiesError] = useCollection(
		query(collection(product.ref, `UserPriorities`), orderBy(`createdAt`, `asc`)).withConverter(UserPriorityConverter),
	)
	useErrorHandler(userPrioritiesError)

	const [potentialRisks, , potentialRisksError] = useCollection(
		query(collection(product.ref, `PotentialRisks`), orderBy(`createdAt`, `asc`)).withConverter(PotentialRiskConverter),
	)
	useErrorHandler(potentialRisksError)

	const [marketLeaders, , marketLeadersError] = useCollection(
		query(collection(product.ref, `MarketLeaders`), orderBy(`createdAt`, `asc`)).withConverter(MarketLeaderConverter),
	)
	useErrorHandler(marketLeadersError)

	const gpt = trpc.gpt.useMutation()

	const personaChange = (index: number, value: string) => {

		setPersonaList(prevList => {
			const updatedList = [...prevList];
			updatedList[index] = {
				...updatedList[index],
				name: value
			};
			return updatedList;
		});
	}

	const personaAction = async (index: number) => {
		const persona = personaList[index]
		if (persona?.name === ``) return

		if (persona?.id) {
			try {
				await updateDoc(doc(product.ref, `Personas`, persona.id).withConverter(PersonaConverter), {
					name: persona.name,
				})
			} catch (error) {
				console.error(error)
			}
		} else {
			try {
				await addDoc(collection(product.ref, `Personas`), {
					...persona,
					createdAt: Timestamp.now(),
				})
			} catch (error) {
				console.error(error)
			}
		}


	}

	return (
		<div className="h-full overflow-auto px-12 pb-8">
			<div className="sticky top-0 z-10 flex flex-col gap-2 bg-bgLayout pt-8 pb-6">
				<Breadcrumb items={[{ title: `Strategy` }, { title: `Kickoff` }]} />
				<div className="leading-normal">
					<h1 className="text-4xl font-semibold">Let’s get this party started!</h1>
					<p className="text-base text-textSecondary">
						What are the stakeholders trying to accomplish?
					</p>
				</div>
			</div>

			<Masonry
				breakpointCols={{ default: 3, 1700: 2, 1300: 2, 1000: 1 }}
				className="flex gap-8"
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
					title="Problem Statement"
					text={product.data().problemStatement}
					isEditing={editingSection === `problemStatement`}
					onEditStart={() => setEditingSection(`problemStatement`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (text) => {
						await updateDoc(product.ref, { problemStatement: text })
					}}
				/>

				<Card
					type="inner"
					title="Personas"
				>

					{personaList.map((persona, index) => (
						<Input className="mb-3"
							key={index}
							prefix={`${index + 1}.`}
							suffix={
								<CloseCircleOutlined />
							}
							value={persona.name}
							onChange={(e) => personaChange(index, e.target.value)}
							onBlur={() => {
								personaAction(index).catch(console.error)
							}}
						/>
					))}
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
					title="Business Outcomes"
					textList={businessOutcomes?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
					isEditing={editingSection === `businessOutcomes`}
					onEditStart={() => setEditingSection(`businessOutcomes`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						console.log(`saving to db`)
						await Promise.all(
							textList.map(async (item) => {
								if (businessOutcomes?.docs.some((doc) => doc.id === item.id)) {
									console.log(`updating doc`)
									await updateDoc(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
										text: item.text,
									}).catch(console.error)
								} else {
									console.log(`setting doc`)
									await setDoc(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
										createdAt: Timestamp.now(),
										text: item.text,
									}).catch(console.error)
								}
							}),
						)
					}}
				// onCommit={async (textList) => {
				// 	console.log(textList)
				// 	const batch = writeBatch(db)
				// 	textList.forEach((item) => {
				// 		batch.update(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
				// 			text: item.text,
				// 		})
				// 	})
				// 	await batch.commit()
				// }}
				/>

				<TextListCard
					title="User Priorities"
					textList={userPriorities?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
					isEditing={editingSection === `userPriorities`}
					onEditStart={() => setEditingSection(`userPriorities`)}
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
					title="Potential Risks"
					textList={potentialRisks?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
					isEditing={editingSection === `potentialRisks`}
					onEditStart={() => setEditingSection(`potentialRisks`)}
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
					title="Market Leaders"
					textList={marketLeaders?.docs.map((item) => ({ id: item.id, text: item.data().text }))}
					isEditing={editingSection === `marketLeaders`}
					onEditStart={() => setEditingSection(`marketLeaders`)}
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
	)
}

export default KickoffClientPage
