import {Button, Card} from "antd"
import {doc, updateDoc} from "firebase/firestore"
import {useState} from "react"

import type {FC} from "react"
import type {Product} from "~/types/db/Products"

import StretchyTextArea from "~/components/StretchyTextArea"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

export type ProblemStatementCardProps = {
	text: string
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
}

const ProblemStatementCard: FC<ProblemStatementCardProps> = ({text, isEditing, onEditStart, onEditEnd}) => {
	const activeProductId = useActiveProductId()
	const [textDraft, setTextDraft] = useState(text)

	return (
		<Card
			type="inner"
			title="Problem Statement"
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
								updateDoc(doc(db, `Products`, activeProductId), {
									problemStatement: textDraft,
								} satisfies Partial<Product>)
									.then(() => {
										onEditEnd()
									})
									.catch(console.error)
							}}
						>
							Done
						</Button>
					</div>
				) : (
					<Button size="small" onClick={() => onEditStart()}>
						Edit
					</Button>
				)
			}
		>
			{isEditing ? (
				<StretchyTextArea value={textDraft} onChange={(e) => setTextDraft(e.target.value)} />
			) : (
				<p className="min-w-0">{textDraft}</p>
			)}
		</Card>
	)
}

export default ProblemStatementCard
