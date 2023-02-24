import {Button, Card, Input} from "antd"
import {Timestamp, addDoc, collection, updateDoc} from "firebase/firestore"
import {useState} from "react"

import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Id} from "~/types"
import type {Result} from "~/types/db/Results"

import StretchyTextArea from "~/components/StretchyTextArea"
import {ResultConverter} from "~/types/db/Results"
import {db} from "~/utils/firebase"

export type ObjectiveCardProps = {
	objectiveId: Id
	result?: QueryDocumentSnapshot<Result>
	isEditing: boolean
	onEditStart?: () => void
	onEditEnd: () => void
}

const ObjectiveCard: FC<ObjectiveCardProps> = ({objectiveId, result, isEditing, onEditStart, onEditEnd}) => {
	const [titleDraft, setTitleDraft] = useState(result?.data().name ?? ``)
	const [textDraft, setTextDraft] = useState(result?.data().text ?? ``)

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
					result?.data().name
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
							onClick={() => {
								if (result) {
									updateDoc(result.ref, {
										name: titleDraft,
										text: textDraft,
									}).catch(console.error)
								} else {
									addDoc(collection(db, `Objectives`, objectiveId, `Results`).withConverter(ResultConverter), {
										createdAt: Timestamp.now(),
										name: titleDraft,
										text: textDraft,
									}).catch(console.error)
								}
								onEditEnd()
							}}
						>
							Done
						</Button>
					</div>
				) : (
					<Button type="link" onClick={() => onEditStart?.()}>
						Edit
					</Button>
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
