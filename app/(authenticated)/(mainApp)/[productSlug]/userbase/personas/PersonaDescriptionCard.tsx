import {Button, Card} from "antd"
import axios from "axios"
import {collection, doc, onSnapshot, query, updateDoc, where} from "firebase/firestore"
import {useState, useEffect} from "react"
import {z} from "zod"

import type {FC} from "react"
import type {Id} from "~/types"
import type {Persona} from "~/types/db/Personas"

import StretchyTextArea from "~/components/StretchyTextArea"
import {Personas} from "~/types/db/Personas"
import {Dialogues, DialogueConverter, Dialogue} from "~/types/db/Dialogues"
import {db} from "~/utils/firebase"
import {useCollectionData} from "react-firebase-hooks/firestore"

export type PersonaDescriptionCardProps = {
	personaId: Id
	productId: Id
	personaPrevQnA: string
	personaName: string
	text: string
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
}

const PersonaDescriptionCard: FC<PersonaDescriptionCardProps> = ({
	personaId,
	productId,
	personaName,
	personaPrevQnA,
	text,
	isEditing,
	onEditStart,
	onEditEnd,
}) => {
	const [textDraft, setTextDraft] = useState(text)
	const [dialogueNotes, setDialogueNotes] = useState<any>(null)

	const fetchDialogueNotes = () => {
		const q = query(
			collection(db, "Dialogues"),
			where(`productId`, `==`, productId),
			where(`persona`, `==`, personaName),
		)
		onSnapshot(q, (snapshot) => {
			const res = snapshot.docs.map((doc) => ({
				...doc.data(),
			}))
			let questionsAndResponses: Dialogue["notes"] = []

			res.forEach((dialogue: Dialogue) => {
				dialogue.notes.forEach((n) => {
					questionsAndResponses.push({question: n.question, response: n.response})
				})
			})
			setDialogueNotes(questionsAndResponses)
		})
	}
	useEffect(() => {
		fetchDialogueNotes()
	}, [personaId])

	const generatePersonaDescription = async () => {
		let stringified = JSON.stringify(dialogueNotes)
		if (personaPrevQnA !== stringified) {
			const gptPrompt = `Summarize these interview notes of a ${personaName} into a one sentence description; ${stringified}`
			try {
				const _res = await axios.post(`/api/gpt`, {prompt: gptPrompt})
				const {response: res} = z.object({response: z.string()}).parse(_res.data)
				setTextDraft(res.trimStart())

				let prevQnA
				if (typeof dialogueNotes === "object") {
					prevQnA = JSON.stringify(dialogueNotes)
				}

				await updateDoc(doc(db, "Personas", personaId), {
					prevQnA,
					description: res.trimStart(),
				})
			} catch (error) {
				console.error(error)
			}
		}
	}

	useEffect(() => {
		if(dialogueNotes?.length > 0) {
			generatePersonaDescription()
		}
	}, [dialogueNotes])

	return (
		<Card
			type="inner"
			title="Description"
			// extra={
			// 	isEditing ? (
			// 		<div className="ml-4 flex gap-2">
			// 			<Button size="small" onClick={() => void onEditEnd()}>
			// 				Cancel
			// 			</Button>
			// 			<Button
			// 				size="small"
			// 				type="primary"
			// 				className="bg-green"
			// 				onClick={async () =>
			// 					void (await updateDoc(doc(db, Personas._, personaId), {
			// 						description: text,
			// 					} satisfies Partial<Persona>))
			// 				}
			// 			>
			// 				Done
			// 			</Button>
			// 		</div>
			// 	) : (
			// 		<button type="button" onClick={() => void onEditStart()} className="text-green">
			// 			Edit
			// 		</button>
			// 	)
			// }
		>
			{/* {isEditing ? (
				<StretchyTextArea value={textDraft} onChange={(e) => void setTextDraft(e.target.value)} />
			) : ( */}
				<p className="min-w-0">{textDraft}</p>
			{/* )} */}
		</Card>
	)
}

export default PersonaDescriptionCard
