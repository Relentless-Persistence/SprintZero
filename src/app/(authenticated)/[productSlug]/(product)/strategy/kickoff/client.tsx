"use client"

import { CloseCircleOutlined } from "@ant-design/icons"
import { Breadcrumb, Button, Card, Input } from "antd"
import { Timestamp, addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type { FC } from "react"
// import type { Persona } from "~/types/db/Products/Personas"

import TextareaCard from "./TextareaCard"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { BusinessOutcomeConverter } from "~/types/db/Products/BusinessOutcomes"
import { MarketLeaderConverter } from "~/types/db/Products/MarketLeaders"
import { PersonaConverter } from "~/types/db/Products/Personas";
import { PotentialRiskConverter } from "~/types/db/Products/PotentialRisks"
import { UserPriorityConverter } from "~/types/db/Products/UserPriorities"
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
	const [addNewBusiness, setAddNewBusiness] = useState(false)
	const [newBusiness, setNewBusiness] = useState(``)
	const [addNewPriority, setAddNewPriority] = useState(false)
	const [newPriority, setNewPriority] = useState(``)
	const [addNewRisk, setAddNewRisk] = useState(false)
	const [newRisk, setNewRisk] = useState(``)
	const [addNewMarket, setAddNewMarket] = useState(false)
	const [newMarket, setNewMarket] = useState(``)

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
				//const newPersonaRef = 
				await addDoc(collection(product.ref, `Personas`), {
					...persona,
					createdAt: Timestamp.now(),
				})

				// const personaDescription = await gpt.mutateAsync({
				// 	prompt: `Write a multi-paragraph description for a user persona called "${persona!.name}" describing who he is. Use plural pronouns to stay gender-neutral when writing.`,
				// });

				// //console.log(personaDescription.response?.trim())

				// await updateDoc(newPersonaRef.withConverter(PersonaConverter), {
				// 	description: personaDescription.response?.trim()
				// }).then().catch()

				// const personaToolset = await gpt.mutateAsync({
				// 	prompt: `Write a description as a numbered list for a user persona called "${persona!.name}" describing his core skills. Use plural pronouns to stay gender-neutral when writing.`,
				// });

				// //console.log(personaToolset.response?.trim())

				// await updateDoc(newPersonaRef.withConverter(PersonaConverter), {
				// 	toolset: personaToolset.response?.trim()
				// }).then().catch()

				// const personaEducation = await gpt.mutateAsync({
				// 	prompt: `Write a multi-paragraph description for a user persona called "${persona!.name}" describing his typical education. Use plural pronouns to stay gender-neutral when writing.`,
				// });

				// //console.log(personaEducation.response?.trim())

				// await updateDoc(newPersonaRef.withConverter(PersonaConverter), {
				// 	education: personaEducation.response?.trim()
				// }).then().catch()

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
								<CloseCircleOutlined onClick={() => {
									if (!persona.id) return;
									deleteDoc(doc(product.ref, `Personas`, persona.id))
										.catch(error => {
											console.error(error);
										});
								}} />
							}

							value={persona.name}
							onChange={(e) => personaChange(index, e.target.value)}
							onBlur={() => {
								personaAction(index).catch(console.error)
							}}
						/>
					))}
				</Card>

				<Card
					type="inner"
					title="Business Outcomes"
				>

					{businessOutcomes?.docs.map(doc => ({ id: doc.id, ...doc.data() })).map((outcome, index) => (
						<Input className="mb-3"
							key={index}
							prefix={`${index + 1}.`}
							suffix={
								<CloseCircleOutlined onClick={() => {
									if (!outcome.id) return;
									deleteDoc(doc(product.ref, `BusinessOutcomes`, outcome.id))
										.catch(error => {
											console.error(error);
										});
								}} />
							}

							value={outcome.text}
							onChange={(e) => {
								if (outcome.text === ``) return
								updateDoc(doc(product.ref, `BusinessOutcomes`, outcome.id), {
									text: e.target.value
								})
									.catch(error => {
										console.error(error)
									})
							}}
						/>
					))}
					{businessOutcomes && businessOutcomes.empty && <Input className="mb-3"
						prefix={`${businessOutcomes.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewBusiness(``)
								setAddNewBusiness(false)
							}} />
						}
						value={newBusiness}
						onChange={(e) => setNewBusiness(e.target.value)}
						onBlur={() => {
							if (newBusiness === ``) return;
							setAddNewBusiness(false)
							addDoc(collection(product.ref, `BusinessOutcomes`), {
								text: newBusiness,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewBusiness(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					{businessOutcomes && addNewBusiness && <Input className="mb-3"
						prefix={`${businessOutcomes.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewBusiness(``)
								setAddNewBusiness(false)
							}} />
						}
						value={newBusiness}
						onChange={(e) => setNewBusiness(e.target.value)}
						onBlur={() => {
							if (newBusiness === ``) return;
							setAddNewBusiness(false)
							addDoc(collection(product.ref, `BusinessOutcomes`), {
								text: newBusiness,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewBusiness(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					<Button block className="mt-1" onClick={() => {
						if (businessOutcomes?.empty) return
						setAddNewBusiness(true)
					}}
					>Add</Button>
				</Card>

				<Card
					type="inner"
					title="User Priorities"
				>

					{userPriorities?.docs.map(doc => ({ id: doc.id, ...doc.data() })).map((priority, index) => (
						<Input className="mb-3"
							key={index}
							prefix={`${index + 1}.`}
							suffix={
								<CloseCircleOutlined onClick={() => {
									if (!priority.id) return;
									deleteDoc(doc(product.ref, `UserPriorities`, priority.id))
										.catch(error => {
											console.error(error);
										});
								}} />
							}

							value={priority.text}
							onChange={(e) => {
								if (priority.text === ``) return
								updateDoc(doc(product.ref, `UserPriorities`, priority.id), {
									text: e.target.value
								})
									.catch(error => {
										console.error(error)
									})
							}}
						/>
					))}
					{userPriorities && userPriorities.empty && <Input className="mb-3"
						prefix={`${userPriorities.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewPriority(``)
								setAddNewPriority(false)
							}} />
						}
						value={newPriority}
						onChange={(e) => setNewPriority(e.target.value)}
						onBlur={() => {
							if (newPriority === ``) return;
							setAddNewPriority(false)
							addDoc(collection(product.ref, `UserPriorities`), {
								text: newPriority,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewPriority(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					{userPriorities && addNewPriority && <Input className="mb-3"
						prefix={`${userPriorities.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewPriority(``)
								setAddNewPriority(false)
							}} />
						}
						value={newPriority}
						onChange={(e) => setNewPriority(e.target.value)}
						onBlur={() => {
							if (newPriority === ``) return;
							setAddNewPriority(false)
							addDoc(collection(product.ref, `UserPriorities`), {
								text: newPriority,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewPriority(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					<Button block className="mt-1" onClick={() => {
						if (userPriorities?.empty) return
						setAddNewPriority(true)
					}}
					>Add</Button>
				</Card>

				<Card
					type="inner"
					title="Potential Risks"
				>

					{potentialRisks?.docs.map(doc => ({ id: doc.id, ...doc.data() })).map((risk, index) => (
						<Input className="mb-3"
							key={index}
							prefix={`${index + 1}.`}
							suffix={
								<CloseCircleOutlined onClick={() => {
									if (!risk.id) return;
									deleteDoc(doc(product.ref, `PotentialRisks`, risk.id))
										.catch(error => {
											console.error(error);
										});
								}} />
							}

							value={risk.text}
							onChange={(e) => {
								if (risk.text === ``) return
								updateDoc(doc(product.ref, `PotentialRisks`, risk.id), {
									text: e.target.value
								})
									.catch(error => {
										console.error(error)
									})
							}}
						/>
					))}
					{potentialRisks && potentialRisks.empty && <Input className="mb-3"
						prefix={`${potentialRisks.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewRisk(``)
								setAddNewRisk(false)
							}} />
						}
						value={newRisk}
						onChange={(e) => setNewRisk(e.target.value)}
						onBlur={() => {
							if (newRisk === ``) return;
							setAddNewRisk(false)
							addDoc(collection(product.ref, `PotentialRisks`), {
								text: newRisk,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewRisk(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					{potentialRisks && addNewRisk && <Input className="mb-3"
						prefix={`${potentialRisks.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewRisk(``)
								setAddNewRisk(false)
							}} />
						}
						value={newRisk}
						onChange={(e) => setNewRisk(e.target.value)}
						onBlur={() => {
							if (newRisk === ``) return;
							setAddNewRisk(false)
							addDoc(collection(product.ref, `PotentialRisks`), {
								text: newRisk,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewRisk(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					<Button block className="mt-1" onClick={() => {
						if (potentialRisks?.empty) return
						setAddNewRisk(true)
					}}
					>Add</Button>
				</Card>

				<Card
					type="inner"
					title="Market Leaders"
				>

					{marketLeaders?.docs.map(doc => ({ id: doc.id, ...doc.data() })).map((market, index) => (
						<Input className="mb-3"
							key={index}
							prefix={`${index + 1}.`}
							suffix={
								<CloseCircleOutlined onClick={() => {
									if (!market.id) return;
									deleteDoc(doc(product.ref, `MarketLeaders`, market.id))
										.catch(error => {
											console.error(error);
										});
								}} />
							}

							value={market.text}
							onChange={(e) => {
								if (market.text === ``) return
								updateDoc(doc(product.ref, `MarketLeaders`, market.id), {
									text: e.target.value
								})
									.catch(error => {
										console.error(error)
									})
							}}
						/>
					))}
					{marketLeaders && marketLeaders.empty && <Input className="mb-3"
						prefix={`${marketLeaders.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewMarket(``)
								setAddNewMarket(false)
							}} />
						}
						value={newMarket}
						onChange={(e) => setNewMarket(e.target.value)}
						onBlur={() => {
							if (newMarket === ``) return;
							setAddNewMarket(false)
							addDoc(collection(product.ref, `MarketLeaders`), {
								text: newMarket,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewMarket(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					{marketLeaders && addNewMarket && <Input className="mb-3"
						prefix={`${marketLeaders.size + 1}.`}
						suffix={
							<CloseCircleOutlined onClick={() => {
								setNewMarket(``)
								setAddNewMarket(false)
							}} />
						}
						value={newMarket}
						onChange={(e) => setNewMarket(e.target.value)}
						onBlur={() => {
							if (newMarket === ``) return;
							setAddNewMarket(false)
							addDoc(collection(product.ref, `MarketLeaders`), {
								text: newMarket,
								createdAt: Timestamp.now(),
							})
								.then(() => {
									setNewMarket(``)
								})
								.catch(error => {
									console.error(error)
								})
						}}
					/>}
					<Button block className="mt-1" onClick={() => {
						if (marketLeaders?.empty) return
						setAddNewMarket(true)
					}}
					>Add</Button>
				</Card>

			</Masonry>
		</div>
	)
}

export default KickoffClientPage
