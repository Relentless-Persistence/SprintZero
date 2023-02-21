import {Button, Card, Input} from "antd"
import {arrayUnion, doc, updateDoc} from "firebase/firestore"
import produce from "immer"
import {nanoid} from "nanoid"
import {useState} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Objective} from "~/types/db/Objectives"

import StretchyTextArea from "~/components/StretchyTextArea"
import {ObjectiveConverter} from "~/types/db/Objectives"
import {db} from "~/utils/firebase"

export type ObjectiveCardProps = {
	objective: QueryDocumentSnapshot<Objective>
	resultId?: string
	isEditing: boolean
	onEditStart?: () => void
	onEditEnd: () => void
}

const ObjectiveCard: FC<ObjectiveCardProps> = ({objective, resultId, isEditing, onEditStart, onEditEnd}) => {
	const result = objective.data().results.find((item) => item.id === resultId)
	const [titleDraft, setTitleDraft] = useState(result?.name ?? ``)
	const [textDraft, setTextDraft] = useState(result?.text ?? ``)

	return (
		<Card
			type="inner"
			title={
				isEditing ? (
					<Input
						size="small"
						value={titleDraft}
						autoFocus
						onChange={(e) => setTitleDraft(e.target.value)}
						className="mr-4"
					/>
				) : (
					result?.name
				)
			}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => onEditEnd()}>
							Cancel
						</Button>
						<Button
							size="small"
							type="primary"
							className="bg-green"
							onClick={() => {
								if (result) {
									const results = produce(objective.data().results, (draft) => {
										const index = draft.findIndex((item) => item.id === result.id)
										draft[index]!.name = titleDraft
										draft[index]!.text = textDraft
									})
									updateDoc(doc(db, `Objectives`, objective.id).withConverter(ObjectiveConverter), {results}).catch(
										console.error,
									)
								} else {
									updateDoc(doc(db, `Objectives`, objective.id).withConverter(ObjectiveConverter), {
										results: arrayUnion({
											id: nanoid(),
											name: titleDraft,
											text: textDraft,
										} satisfies Objective[`results`][number]),
									}).catch(console.error)
								}
								onEditEnd()
							}}
						>
							Done
						</Button>
					</div>
				) : (
					<button type="button" onClick={() => onEditStart?.()} className="text-green">
						Edit
					</button>
				)
			}
		>
			{isEditing ? (
				<div className="flex flex-col gap-2">
					<StretchyTextArea value={textDraft} onChange={(e) => setTextDraft(e.target.value)} />
				</div>
			) : (
				<p className="min-w-0">{textDraft}</p>
			)}
		</Card>
	)
}

export default ObjectiveCard
