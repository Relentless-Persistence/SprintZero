"use client"

import {Breadcrumb, Tabs, Input} from "antd"
import {addDoc, collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Persona} from "~/types/db/Personas"

import EditableListCard from "~/components/EditableListCard"
import EditableTextAreaCard from "~/components/EditableTextAreaCard"
import {Personas, PersonaConverter} from "~/types/db/Personas"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const PersonasPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeTab, setActiveTab] = useState(`add`)
	const [newPersonaInput, setNewPersonaInput] = useState<string | undefined>(undefined)
	const [isEditingCard, setIsEditingCard] = useState<
		| `goals`
		| `interactions`
		| `tasks`
		| `responsibilities`
		| `priorities`
		| `frustrations`
		| `changes`
		| `description`
		| `dayInTheLife`
		| undefined
	>(undefined)

	const [personas] = useCollectionData(
		query(collection(db, Personas._), where(Personas.productId, `==`, activeProductId)).withConverter(PersonaConverter),
	)

	const hasSetDefaultPersona = useRef(false)
	useEffect(() => {
		if (personas?.[0] && !hasSetDefaultPersona.current) {
			setActiveTab(personas[0].id)
			hasSetDefaultPersona.current = true
		}
	}, [personas])

	return (
		<Tabs
			tabPosition="right"
			activeKey={newPersonaInput !== undefined && activeTab === `add` ? `new` : activeTab}
			onChange={(key) => {
				if (key !== `new`) setActiveTab(key)
			}}
			items={(() => {
				const items = []
				if (personas) {
					items.push(
						...personas.map((persona) => ({
							key: persona.id,
							label: persona.name,
							children: (
								<div className="flex flex-col gap-6 px-12 py-8">
									<Breadcrumb>
										<Breadcrumb.Item>Userbase</Breadcrumb.Item>
										<Breadcrumb.Item>Personas</Breadcrumb.Item>
									</Breadcrumb>

									<div className="grid grid-cols-2 gap-4">
										<div className="flex flex-col gap-4">
											<EditableListCard
												isEditing={isEditingCard === `goals`}
												onEditStart={() => void setIsEditingCard(`goals`)}
												title="Goals"
												disableTitleEditing
												list={persona.goals}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {goals: list} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
											<EditableListCard
												isEditing={isEditingCard === `interactions`}
												onEditStart={() => void setIsEditingCard(`interactions`)}
												title="Interactions"
												disableTitleEditing
												list={persona.interactions}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {
														interactions: list,
													} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
											<EditableListCard
												isEditing={isEditingCard === `tasks`}
												onEditStart={() => void setIsEditingCard(`tasks`)}
												title="Tasks"
												disableTitleEditing
												list={persona.tasks}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {tasks: list} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
											<EditableListCard
												isEditing={isEditingCard === `responsibilities`}
												onEditStart={() => void setIsEditingCard(`responsibilities`)}
												title="Responsibilities"
												disableTitleEditing
												list={persona.responsibilities}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {
														responsibilities: list,
													} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
											<EditableListCard
												isEditing={isEditingCard === `priorities`}
												onEditStart={() => void setIsEditingCard(`priorities`)}
												title="Priorities"
												disableTitleEditing
												list={persona.priorities}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {
														priorities: list,
													} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
											<EditableListCard
												isEditing={isEditingCard === `frustrations`}
												onEditStart={() => void setIsEditingCard(`frustrations`)}
												title="Frustrations"
												disableTitleEditing
												list={persona.frustrations}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {
														frustrations: list,
													} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
											<EditableListCard
												isEditing={isEditingCard === `changes`}
												onEditStart={() => void setIsEditingCard(`changes`)}
												title="Changes"
												disableTitleEditing
												list={persona.changes}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {changes: list} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
										</div>
										<div className="flex flex-col gap-4">
											<EditableTextAreaCard
												isEditing={isEditingCard === `description`}
												onEditStart={() => void setIsEditingCard(`description`)}
												title="Description"
												disableTitleEditing
												text={persona.description}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, text) => {
													await updateDoc(doc(db, Personas._, persona.id), {
														description: text,
													} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
											<EditableListCard
												isEditing={isEditingCard === `dayInTheLife`}
												onEditStart={() => void setIsEditingCard(`dayInTheLife`)}
												title="A Day in the Life"
												disableTitleEditing
												list={persona.dayInTheLife}
												onCancel={() => void setIsEditingCard(undefined)}
												onCommit={async (title, list) => {
													await updateDoc(doc(db, Personas._, persona.id), {
														dayInTheLife: list,
													} satisfies Partial<Persona>)
													setIsEditingCard(undefined)
												}}
											/>
										</div>
									</div>
								</div>
							),
						})),
					)
				}
				if (newPersonaInput !== undefined) {
					items.push({
						key: `new`,
						label: (
							<Input
								size="small"
								value={newPersonaInput}
								onChange={(e) => void setNewPersonaInput(e.target.value)}
								onKeyDown={async (e) => {
									if (e.key === `Enter`) {
										const ref = await addDoc(collection(db, Personas._), {
											changes: [],
											dayInTheLife: [],
											description: ``,
											frustrations: [],
											goals: [],
											interactions: [],
											name: newPersonaInput,
											priorities: [],
											responsibilities: [],
											tasks: [],
											productId: activeProductId,
										} satisfies Persona)
										setActiveTab(ref.id)
										setNewPersonaInput(undefined)
									}
								}}
								className="-mx-4 w-16"
							/>
						),
						children: (
							<div className="px-12 py-8">
								<Breadcrumb>
									<Breadcrumb.Item>Userbase</Breadcrumb.Item>
									<Breadcrumb.Item>Personas</Breadcrumb.Item>
								</Breadcrumb>
							</div>
						),
					})
				}
				items.push({
					key: `add`,
					label: (
						<button
							type="button"
							onClick={() => {
								setNewPersonaInput(``)
								setActiveTab(`new`)
							}}
						>
							Add
						</button>
					),
					children: (
						<div className="px-12 py-8">
							<Breadcrumb>
								<Breadcrumb.Item>Userbase</Breadcrumb.Item>
								<Breadcrumb.Item>Personas</Breadcrumb.Item>
							</Breadcrumb>
						</div>
					),
				})
				return items
			})()}
			className="h-full"
		/>
	)
}

export default PersonasPage
