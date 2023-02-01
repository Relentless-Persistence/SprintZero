"use client"

import {Breadcrumb, Card, Input} from "antd"
import {doc} from "firebase/firestore"
import {useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"

import type {FC} from "react"

import EditButtons from "./EditButtons"
import TextListEditor from "./TextListEditor"
import {ProductConverter, Products} from "~/types/db/Products"
import {updateProduct} from "~/utils/mutations"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const KickoffPage: FC = () => {
	const activeProductId = useActiveProductId()
	const [activeProduct] = useDocumentData(doc(db, Products._, activeProductId).withConverter(ProductConverter))
	const [editingSection, setEditingSection] = useState<
		`problemStatement` | `personas` | `successMetrics` | `businessPriorities` | undefined
	>(undefined)

	const [textState, setTextState] = useState(``)
	const [textListState, setTextListState] = useState<Array<{id: string; text: string}>>([])

	return (
		<div className="h-full space-y-6 px-12 py-8">
			<Breadcrumb>
				<Breadcrumb.Item>Strategy</Breadcrumb.Item>
				<Breadcrumb.Item>Kickoff</Breadcrumb.Item>
			</Breadcrumb>
			<div className="grid grid-cols-2 gap-8">
				<Card
					type="inner"
					title="Problem Statement"
					extra={
						<EditButtons
							onEditStart={() => {
								setTextState(activeProduct?.problemStatement ?? ``)
								setEditingSection(`problemStatement`)
							}}
							onEditEnd={() => {
								setTextState(``)
								setEditingSection(undefined)
							}}
							isEditing={editingSection === `problemStatement`}
							onCommit={() => void updateProduct({id: activeProduct!.id, data: {problemStatement: textState}})}
						/>
					}
				>
					{editingSection === `problemStatement` ? (
						<Input.TextArea value={textState} onChange={(e) => void setTextState(e.target.value)} />
					) : (
						<p>{activeProduct?.problemStatement}</p>
					)}
				</Card>

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
							onCommit={() =>
								void updateProduct({
									id: activeProduct!.id,
									data: {successMetrics: textListState.filter((item) => item.text !== ``)},
								})
							}
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
							onCommit={() =>
								void updateProduct({
									id: activeProduct!.id,
									data: {personas: textListState.filter((item) => item.text !== ``)},
								})
							}
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
							onCommit={() =>
								void updateProduct({
									id: activeProduct!.id,
									data: {businessPriorities: textListState.filter((item) => item.text !== ``)},
								})
							}
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
	)
}

export default KickoffPage
