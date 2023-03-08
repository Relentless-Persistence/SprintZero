"use client"

import {Breadcrumb, Card, Tabs} from "antd"
import {collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useEffect, useRef, useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Persona} from "~/types/db/Personas"

import DayInTheLife from "./DayInTheLife"
import EditableListCard from "./EditableListCard"
import {PersonaConverter} from "~/types/db/Personas"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const PersonasClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeTab, setActiveTab] = useState(``)
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

	const [personas] = useCollection(
		query(collection(db, `Personas`), where(`productId`, `==`, activeProductId)).withConverter(PersonaConverter),
	)

	const hasSetDefaultPersona = useRef(false)
	useEffect(() => {
		if (personas?.docs[0] && !hasSetDefaultPersona.current) {
			setActiveTab(personas.docs[0].id)
			hasSetDefaultPersona.current = true
		}
	}, [personas])

	return (
		<Tabs
			tabPosition="right"
			activeKey={activeTab}
			onChange={(key) => setActiveTab(key)}
			items={personas?.docs.map((persona) => ({
				key: persona.id,
				label: persona.data().name,
				children: (
					<div className="flex h-full flex-col overflow-auto">
						<div className="sticky top-0 z-10 bg-bgLayout px-12 pt-8 pb-6">
							<Breadcrumb>
								<Breadcrumb.Item>Userbase</Breadcrumb.Item>
								<Breadcrumb.Item>Personas</Breadcrumb.Item>
							</Breadcrumb>
						</div>

						<div className="grid grid-cols-2 gap-4 px-12 pb-8">
							<div className="flex flex-col gap-4">
								<EditableListCard
									isEditing={isEditingCard === `goals`}
									onEditStart={() => setIsEditingCard(`goals`)}
									title="Goals"
									list={persona.data().goals}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {goals: list} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
								<EditableListCard
									isEditing={isEditingCard === `interactions`}
									onEditStart={() => setIsEditingCard(`interactions`)}
									title="Interactions"
									list={persona.data().interactions}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {
											interactions: list,
										} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
								<EditableListCard
									isEditing={isEditingCard === `tasks`}
									onEditStart={() => setIsEditingCard(`tasks`)}
									title="Tasks"
									list={persona.data().tasks}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {tasks: list} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
								<EditableListCard
									isEditing={isEditingCard === `responsibilities`}
									onEditStart={() => setIsEditingCard(`responsibilities`)}
									title="Responsibilities"
									list={persona.data().responsibilities}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {
											responsibilities: list,
										} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
								<EditableListCard
									isEditing={isEditingCard === `priorities`}
									onEditStart={() => setIsEditingCard(`priorities`)}
									title="Priorities"
									list={persona.data().priorities}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {
											priorities: list,
										} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
								<EditableListCard
									isEditing={isEditingCard === `frustrations`}
									onEditStart={() => setIsEditingCard(`frustrations`)}
									title="Frustrations"
									list={persona.data().frustrations}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {
											frustrations: list,
										} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
								<EditableListCard
									isEditing={isEditingCard === `changes`}
									onEditStart={() => setIsEditingCard(`changes`)}
									title="Changes"
									list={persona.data().changes}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {changes: list} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
							</div>
							<div className="flex flex-col gap-4">
								<Card title="Description">
									<p>{persona.data().description}</p>
								</Card>
								<DayInTheLife
									isEditing={isEditingCard === `dayInTheLife`}
									onEditStart={() => setIsEditingCard(`dayInTheLife`)}
									title="A Day in the Life"
									list={persona.data().dayInTheLife}
									onCancel={() => setIsEditingCard(undefined)}
									onCommit={async (title, list) => {
										await updateDoc(doc(db, `Personas`, persona.id), {
											dayInTheLife: list,
										} satisfies Partial<Persona>)
										setIsEditingCard(undefined)
									}}
								/>
							</div>
						</div>
					</div>
				),
			}))}
			className="h-full"
		/>
	)
}

export default PersonasClientPage
