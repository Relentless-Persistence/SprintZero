"use client"

import {Breadcrumb} from "antd"
import {Timestamp, collection, doc, getDoc, orderBy, query, setDoc, updateDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection, useDocumentData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Id} from "~/types"

import EditableTextCard from "./EditableTextCard"
import EditableTextListCard from "./EditableTextListCard"
import {PersonaConverter} from "~/types/db/Products/Personas"
import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const KickoffClientPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
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
		query(
			collection(db, `Personas`),
			where(`productId`, `==`, activeProductId),
			orderBy(`createdAt`, `asc`),
		).withConverter(PersonaConverter),
	)

	return (
		<div className="h-full overflow-auto px-12 pb-8">
			<Breadcrumb className="sticky top-0 z-10 bg-bgLayout pt-8 pb-6">
				<Breadcrumb.Item>Strategy</Breadcrumb.Item>
				<Breadcrumb.Item>Kickoff</Breadcrumb.Item>
			</Breadcrumb>

			<Masonry
				breakpointCols={{default: 4, 1700: 3, 1300: 2, 1000: 1}}
				className="flex gap-8"
				columnClassName="flex flex-col gap-8"
			>
				<EditableTextCard
					title="Problem Statement"
					text={activeProduct?.problemStatement ?? ``}
					isEditing={editingSection === `problemStatement`}
					onEditStart={() => setEditingSection(`problemStatement`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (text) => {
						await updateDoc(doc(db, `Products`, activeProductId).withConverter(ProductConverter), {
							problemStatement: text,
						})
					}}
				/>

				<EditableTextListCard
					title="Personas"
					textList={personas?.docs.map((doc) => ({id: doc.id as Id, text: doc.data().name})) ?? []}
					isEditing={editingSection === `personas`}
					onEditStart={() => setEditingSection(`personas`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await Promise.all(
							textList.map(async (item) => {
								const existingDoc = getDoc(doc(db, `Personas`, item.id))
								if ((await existingDoc).exists()) {
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
										productId: activeProductId,
									})
								}
							}),
						)
					}}
				/>

				<EditableTextListCard
					title="Business Outcomes"
					textList={activeProduct?.businessOutcomes}
					isEditing={editingSection === `businessOutcomes`}
					onEditStart={() => setEditingSection(`businessOutcomes`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(doc(db, `Products`, activeProductId).withConverter(ProductConverter), {
							businessOutcomes: textList,
						})
					}}
				/>

				<EditableTextListCard
					title="User Priorities"
					textList={activeProduct?.userPriorities}
					isEditing={editingSection === `userPriorities`}
					onEditStart={() => setEditingSection(`userPriorities`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(doc(db, `Products`, activeProductId).withConverter(ProductConverter), {
							userPriorities: textList,
						})
					}}
				/>

				<EditableTextListCard
					title="Potential Risks"
					textList={activeProduct?.potentialRisks}
					isEditing={editingSection === `potentialRisks`}
					onEditStart={() => setEditingSection(`potentialRisks`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(doc(db, `Products`, activeProductId).withConverter(ProductConverter), {
							potentialRisks: textList,
						})
					}}
				/>

				<EditableTextListCard
					title="Market Leaders"
					textList={activeProduct?.marketLeaders}
					isEditing={editingSection === `marketLeaders`}
					onEditStart={() => setEditingSection(`marketLeaders`)}
					onEditEnd={() => setEditingSection(undefined)}
					onCommit={async (textList) => {
						await updateDoc(doc(db, `Products`, activeProductId).withConverter(ProductConverter), {
							marketLeaders: textList,
						})
					}}
				/>
			</Masonry>
		</div>
	)
}

export default KickoffClientPage
