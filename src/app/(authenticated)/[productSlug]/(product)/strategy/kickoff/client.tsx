"use client"

import {Breadcrumb} from "antd"
import {Timestamp, collection, doc, getDoc, orderBy, query, setDoc, updateDoc, writeBatch} from "firebase/firestore"
import {useState} from "react"
import {useErrorHandler} from "react-error-boundary"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"

import EditableTextCard from "./EditableTextCard"
import EditableTextListCard from "./EditableTextListCard"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {BusinessOutcomeConverter} from "~/types/db/Products/BusinessOutcomes"
import {MarketLeaderConverter} from "~/types/db/Products/MarketLeaders"
import {PersonaConverter} from "~/types/db/Products/Personas"
import {PotentialRiskConverter} from "~/types/db/Products/PotentialRisks"
import {UserPriorityConverter} from "~/types/db/Products/UserPriorities"
import {db} from "~/utils/firebase"
import {trpc} from "~/utils/trpc"

const KickoffClientPage: FC = () => {
	const {product} = useAppContext()
	const [editingSection, setEditingSection] = useState<
		| `problemStatement`
		| `personas`
		| `businessOutcomes`
		| `userPriorities`
		| `potentialRisks`
		| `marketLeaders`
		| undefined
	>(undefined)

	const [personas, , personasError] = useCollection(
		query(collection(product.ref, `Personas`), orderBy(`createdAt`, `asc`)).withConverter(PersonaConverter),
	)
	useErrorHandler(personasError)
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

	return (
		<div className="h-full overflow-auto px-12 pb-8">
			<Breadcrumb
				items={[{title: `Strategy`}, {title: `Kickoff`}]}
				className="sticky top-0 z-10 bg-bgLayout pt-8 pb-6"
			/>

			<Masonry
				breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
				className="flex gap-8"
				columnClassName="flex flex-col gap-8"
			>
				<EditableTextCard
					title="Problem Statement"
					text={product.data().problemStatement}
					isEditing={editingSection === `problemStatement`}
					onEditStart={() => setEditingSection(`problemStatement`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (text) => {
						await updateDoc(product.ref, {problemStatement: text})
					}}
				/>

				<EditableTextListCard
					title="Personas"
					textList={personas?.docs.map((doc) => ({id: doc.id, text: doc.data().name})) ?? []}
					isEditing={editingSection === `personas`}
					onEditStart={() => setEditingSection(`personas`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await Promise.all(
							textList.map(async (item) => {
								const existingDoc = await getDoc(doc(product.ref, `Personas`, item.id))
								if (existingDoc.exists()) {
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
									updateDoc(doc(product.ref, `Personas`, item.id).withConverter(PersonaConverter), {
										description: (
											await gpt.mutateAsync({
												prompt: `Below is a vision statement for an app I'm building:\n\n"${
													product.data().finalVision
												}"\n\nDescribe the user persona "${item.text}" in a paragraph.`,
											})
										).response
											?.replace(/^\\n+/, ``)
											.replace(/\\n+$/, ``),
									}).catch(console.error)
								}
							}),
						)
					}}
				/>

				<EditableTextListCard
					title="Business Outcomes"
					textList={businessOutcomes?.docs.map((item) => ({id: item.id, text: item.data().text}))}
					isEditing={editingSection === `businessOutcomes`}
					onEditStart={() => setEditingSection(`businessOutcomes`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						const batch = writeBatch(db)
						textList.forEach((item) => {
							batch.update(doc(product.ref, `BusinessOutcomes`, item.id).withConverter(BusinessOutcomeConverter), {
								text: item.text,
							})
						})
						await batch.commit()
					}}
				/>

				<EditableTextListCard
					title="User Priorities"
					textList={userPriorities?.docs.map((item) => ({id: item.id, text: item.data().text}))}
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

				<EditableTextListCard
					title="Potential Risks"
					textList={potentialRisks?.docs.map((item) => ({id: item.id, text: item.data().text}))}
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

				<EditableTextListCard
					title="Market Leaders"
					textList={marketLeaders?.docs.map((item) => ({id: item.id, text: item.data().text}))}
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
