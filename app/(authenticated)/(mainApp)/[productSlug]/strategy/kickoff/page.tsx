"use client"

import {Breadcrumb, Card} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"
import Masonry from "react-masonry-css"

import type {FC} from "react"
import type {Product} from "~/types/db/Products"

import EditButtons from "./EditButtons"
import ProblemStatementCard from "./ProblemStatementCard"
import TextListEditor from "~/components/TextListEditor"
import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const KickoffPage: FC = () => {
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

	const [textListState, setTextListState] = useState<Array<{id: string; text: string}>>([])

	return (
		<div className="h-full overflow-auto px-12 pb-8">
			<Breadcrumb className="sticky top-0 z-10 bg-[#f0f2f5] pt-8 pb-6">
				<Breadcrumb.Item>Strategy</Breadcrumb.Item>
				<Breadcrumb.Item>Kickoff</Breadcrumb.Item>
			</Breadcrumb>
			<Masonry
				breakpointCols={{1000: 1, 1300: 2, 1600: 3}}
				className="flex gap-8"
				columnClassName="bg-clip-padding flex flex-col gap-8"
			>
				{activeProduct && (
					<ProblemStatementCard
						text={activeProduct.problemStatement}
						isEditing={editingSection === `problemStatement`}
						onEditStart={() => {
							setEditingSection(`problemStatement`)
						}}
						onEditEnd={() => setEditingSection(undefined)}
					/>
				)}

				<Card
					type="inner"
					title="Personas Impacted"
					extra={
						<EditButtons
							onEditStart={() => {
								setTextListState(activeProduct!.personas)
								setEditingSection(`personas`)
							}}
							onEditEnd={() => {
								setTextListState([])
								setEditingSection(undefined)
							}}
							isEditing={editingSection === `personas`}
							onCommit={async () => {
								const data: Partial<Product> = {
									personas: textListState.filter((item) => item.text !== ``),
								}
								await updateDoc(doc(db, `Products`, activeProductId), data)
							}}
						/>
					}
				>
					{editingSection === `personas` ? (
						<TextListEditor textList={textListState} onChange={setTextListState} />
					) : (
						<ol className="list-decimal pl-4">
							{activeProduct?.personas.map((item) => (
								<li key={item.id}>{item.text}</li>
							))}
						</ol>
					)}
				</Card>

				<Card
					type="inner"
					title="Business Outcomes"
					extra={
						<EditButtons
							onEditStart={() => {
								setTextListState(activeProduct!.businessOutcomes)
								setEditingSection(`businessOutcomes`)
							}}
							onEditEnd={() => {
								setTextListState([])
								setEditingSection(undefined)
							}}
							isEditing={editingSection === `businessOutcomes`}
							onCommit={async () => {
								const data: Partial<Product> = {
									businessOutcomes: textListState.filter((item) => item.text !== ``),
								}
								await updateDoc(doc(db, `Products`, activeProductId), data)
							}}
						/>
					}
				>
					{editingSection === `businessOutcomes` ? (
						<TextListEditor textList={textListState} onChange={setTextListState} />
					) : (
						<ol className="list-decimal pl-4">
							{activeProduct?.businessOutcomes.map((item) => (
								<li key={item.id}>{item.text}</li>
							))}
						</ol>
					)}
				</Card>

				<Card
					type="inner"
					title="User Priorities"
					extra={
						<EditButtons
							onEditStart={() => {
								setTextListState(activeProduct!.userPriorities)
								setEditingSection(`userPriorities`)
							}}
							onEditEnd={() => {
								setTextListState([])
								setEditingSection(undefined)
							}}
							isEditing={editingSection === `userPriorities`}
							onCommit={async () => {
								const data: Partial<Product> = {
									userPriorities: textListState.filter((item) => item.text !== ``),
								}
								await updateDoc(doc(db, `Products`, activeProductId), data)
							}}
						/>
					}
				>
					{editingSection === `userPriorities` ? (
						<TextListEditor textList={textListState} onChange={setTextListState} />
					) : (
						<ol className="list-decimal pl-4">
							{activeProduct?.userPriorities.map((item) => (
								<li key={item.id}>{item.text}</li>
							))}
						</ol>
					)}
				</Card>

				<Card
					type="inner"
					title="Potential Risks"
					extra={
						<EditButtons
							onEditStart={() => {
								setTextListState(activeProduct!.potentialRisks)
								setEditingSection(`potentialRisks`)
							}}
							onEditEnd={() => {
								setTextListState([])
								setEditingSection(undefined)
							}}
							isEditing={editingSection === `potentialRisks`}
							onCommit={async () => {
								const data: Partial<Product> = {
									potentialRisks: textListState.filter((item) => item.text !== ``),
								}
								await updateDoc(doc(db, `Products`, activeProductId), data)
							}}
						/>
					}
				>
					{editingSection === `potentialRisks` ? (
						<TextListEditor textList={textListState} onChange={setTextListState} />
					) : (
						<ol className="list-decimal pl-4">
							{activeProduct?.potentialRisks.map((item) => (
								<li key={item.id}>{item.text}</li>
							))}
						</ol>
					)}
				</Card>

				<Card
					type="inner"
					title="Market Leaders"
					extra={
						<EditButtons
							onEditStart={() => {
								setTextListState(activeProduct!.marketLeaders)
								setEditingSection(`marketLeaders`)
							}}
							onEditEnd={() => {
								setTextListState([])
								setEditingSection(undefined)
							}}
							isEditing={editingSection === `marketLeaders`}
							onCommit={async () => {
								const data: Partial<Product> = {
									marketLeaders: textListState.filter((item) => item.text !== ``),
								}
								await updateDoc(doc(db, `Products`, activeProductId), data)
							}}
						/>
					}
				>
					{editingSection === `marketLeaders` ? (
						<TextListEditor textList={textListState} onChange={setTextListState} />
					) : (
						<ol className="list-decimal pl-4">
							{activeProduct?.marketLeaders.map((item) => (
								<li key={item.id}>{item.text}</li>
							))}
						</ol>
					)}
				</Card>
			</Masonry>
		</div>
	)
}

export default KickoffPage
