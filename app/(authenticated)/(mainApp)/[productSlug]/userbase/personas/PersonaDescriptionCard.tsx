import {Button, Card} from "antd"
import {collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useState} from "react"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Persona} from "~/types/db/Personas"

import StretchyTextArea from "~/components/StretchyTextArea"
import {Personas} from "~/types/db/Personas"
import {db} from "~/utils/firebase"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { useActiveProductId } from "~/utils/useActiveProductId"

export type PersonaDescriptionCardProps = {
	personaId: Id
	text: string
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
}

const PersonaDescriptionCard: FC<PersonaDescriptionCardProps> = ({
	personaId,
	text,
	isEditing,
	onEditStart,
	onEditEnd,
}) => {
	const activeProductId = useActiveProductId()
	const [textDraft, setTextDraft] = useState(text)
	const [dialogues] = useCollectionData(query(collection(db, Dialogues._), where(Dialogues.productId, `==`, activeProductId)).withConverter(DialogueConverter),)

	return (
		<Card
			type="inner"
			title="Description"
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => void onEditEnd()}>
							Cancel
						</Button>
						<Button
							size="small"
							type="primary"
							className="bg-green"
							onClick={async () =>
								void (await updateDoc(doc(db, Personas._, personaId), {
									description: text,
								} satisfies Partial<Persona>))
							}
						>
							Done
						</Button>
					</div>
				) : (
					<button type="button" onClick={() => void onEditStart()} className="text-green">
						Edit
					</button>
				)
			}
		>
			{isEditing ? (
				<StretchyTextArea value={textDraft} onChange={(e) => void setTextDraft(e.target.value)} />
			) : (
				<p className="min-w-0">{textDraft}</p>
			)}
		</Card>
	)
}

export default PersonaDescriptionCard
