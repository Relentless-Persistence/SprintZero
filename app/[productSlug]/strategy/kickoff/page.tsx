"use client"

import {Breadcrumb, Card, Input} from "antd5"
import {useAtomValue} from "jotai"
import {useState} from "react"

import type {FC} from "react"

import EditButtons from "./EditButtons"
import TextListEditor from "./TextListEditor"
import {updateProduct} from "~/utils/api/mutations"
import {activeProductAtom} from "~/utils/atoms"

const Kickoff: FC = () => {
	const activeProduct = useAtomValue(activeProductAtom)
	const [editingSection, setEditingSection] = useState<
		`problemStatement` | `personas` | `successMetrics` | `businessPriorities` | undefined
	>(undefined)

	const [textState, setTextState] = useState(``)
	const [textListState, setTextListState] = useState<Array<{id: string; text: string}>>([])

	return (
		<div className="h-full space-y-6 px-12 py-8">
			<div className="mb-4">
				<Breadcrumb>
					<Breadcrumb.Item>Strategy</Breadcrumb.Item>
					<Breadcrumb.Item>Kickoff</Breadcrumb.Item>
				</Breadcrumb>
			</div>
			<div className="grid grid-cols-2 gap-8">
				<Card
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

export default Kickoff
