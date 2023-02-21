import {Card} from "antd"
import {useState} from "react"

import type {FC} from "react"

import TextListEditor from "~/components/TextListEditor"

export type PersonasImpactedCardProps = {
	isEditing: boolean
}

const PersonasImpactedCard: FC<PersonasImpactedCardProps> = ({isEditing}) => {
	const [draftPersonas, setDraftPersonas] = useState([])

	return <Card>{isEditing ? <TextListEditor textList={draftPersonas} onChange={setDraftPersonas} /> : <ol></ol>}</Card>
}

export default PersonasImpactedCard
