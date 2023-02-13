"use client"

import {Breadcrumb, Card} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Product} from "~/types/db/Products"

import EditButtons from "./EditButtons"
import ProblemStatementCard from "./ProblemStatementCard"
import TextListEditor from "../../../../../../components/TextListEditor"
import {ProductConverter} from "~/types/db/Products"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const KickoffPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))
	const [editingSection, setEditingSection] = useState<
		`problemStatement` | `personas` | `successMetrics` | `businessPriorities` | undefined
	>(undefined)

	const [textListState, setTextListState] = useState<Array<{id: string; text: string}>>([])

	return (
		<div className="h-full overflow-auto px-12 pb-8">
			<Breadcrumb className="sticky top-0 z-10 bg-[#f0f2f5] pt-8 pb-6">
				<Breadcrumb.Item>Strategy</Breadcrumb.Item>
				<Breadcrumb.Item>Kickoff</Breadcrumb.Item>
			</Breadcrumb>
			<div className="grid grid-cols-2 gap-8">
				<div className="flex flex-col gap-8">
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
						title="Identified Personas"
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
				</div>

				<div className="flex flex-col gap-8">
					<Card
						type="inner"
						title="Success Metrics"
						extra={
							<EditButtons
								onEditStart={() => {
									setTextListState(activeProduct!.successMetrics)
									setEditingSection(`successMetrics`)
								}}
								onEditEnd={() => {
									setTextListState([])
									setEditingSection(undefined)
								}}
								isEditing={editingSection === `successMetrics`}
								onCommit={async () => {
									const data: Partial<Product> = {
										successMetrics: textListState.filter((item) => item.text !== ``),
									}
									await updateDoc(doc(db, `Products`, activeProductId), data)
								}}
							/>
						}
					>
						{editingSection === `successMetrics` ? (
							<TextListEditor textList={textListState} onChange={setTextListState} />
						) : (
							<ol className="list-decimal pl-4">
								{activeProduct?.successMetrics.map((item) => (
									<li key={item.id}>{item.text}</li>
								))}
							</ol>
						)}
					</Card>

					<Card
						type="inner"
						title="Business Priorities"
						extra={
							<EditButtons
								onEditStart={() => {
									setTextListState(activeProduct!.businessPriorities)
									setEditingSection(`businessPriorities`)
								}}
								onEditEnd={() => {
									setTextListState([])
									setEditingSection(undefined)
								}}
								isEditing={editingSection === `businessPriorities`}
								onCommit={async () => {
									const data: Partial<Product> = {
										businessPriorities: textListState.filter((item) => item.text !== ``),
									}
									await updateDoc(doc(db, `Products`, activeProductId), data)
								}}
							/>
						}
					>
						{editingSection === `businessPriorities` ? (
							<TextListEditor textList={textListState} onChange={setTextListState} />
						) : (
							<ol className="list-decimal pl-4">
								{activeProduct?.businessPriorities.map((item) => (
									<li key={item.id}>{item.text}</li>
								))}
							</ol>
						)}
					</Card>
				</div>
			</div>
		</div>
	)
}

export default KickoffPage
