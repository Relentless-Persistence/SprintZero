"use client"

import {Breadcrumb} from "antd"
import {Timestamp, collection, doc, getDoc, orderBy, query, setDoc, updateDoc} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"

import EditableTextCard from "./EditableTextCard"
import EditableTextListCard from "./EditableTextListCard"
import {useProduct} from "~/app/(authenticated)/useProduct"
import {PersonaConverter} from "~/types/db/Products/Personas"
import {db} from "~/utils/firebase"

const KickoffClientPage: FC = () => {
	const product = useProduct()
	const [editingSection, setEditingSection] = useState<
		| `problemStatement`
		| `personas`
		| `businessOutcomes`
		| `userPriorities`
		| `potentialRisks`
		| `marketLeaders`
		| undefined
	>(undefined)

	const [personas] = useCollection(
		query(collection(product.ref, `Personas`), orderBy(`createdAt`, `asc`)).withConverter(PersonaConverter),
	)

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
									await updateDoc(doc(db, `Personas`, item.id).withConverter(PersonaConverter), {
										name: item.text,
									})
								} else {
									await setDoc(doc(db, `Personas`, item.id).withConverter(PersonaConverter), {
										changes: [],
										createdAt: Timestamp.now(),
										dayInTheLife: [],
										description: ``,
										frustrations: [],
										goals: [],
										interactions: [],
										name: item.text,
										priorities: [],
										responsibilities: [],
										tasks: [],
									})
								}
							}),
						)
					}}
				/>

				<EditableTextListCard
					title="Business Outcomes"
					textList={product.data().businessOutcomes}
					isEditing={editingSection === `businessOutcomes`}
					onEditStart={() => setEditingSection(`businessOutcomes`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(product.ref, {businessOutcomes: textList})
					}}
				/>

				<EditableTextListCard
					title="User Priorities"
					textList={product.data().userPriorities}
					isEditing={editingSection === `userPriorities`}
					onEditStart={() => setEditingSection(`userPriorities`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(product.ref, {userPriorities: textList})
					}}
				/>

				<EditableTextListCard
					title="Potential Risks"
					textList={product.data().potentialRisks}
					isEditing={editingSection === `potentialRisks`}
					onEditStart={() => setEditingSection(`potentialRisks`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(product.ref, {potentialRisks: textList})
					}}
				/>

				<EditableTextListCard
					title="Market Leaders"
					textList={product.data().marketLeaders}
					isEditing={editingSection === `marketLeaders`}
					onEditStart={() => setEditingSection(`marketLeaders`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(product.ref, {marketLeaders: textList})
					}}
				/>
			</Masonry>
		</div>
	)
}

export default KickoffClientPage
