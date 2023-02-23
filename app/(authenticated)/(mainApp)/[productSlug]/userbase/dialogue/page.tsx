import type {Metadata} from "next"
import type {FC} from "react"

import DialogueClientPage from "./client"

export const metadata: Metadata = {
	title: `Dialogue | SprintZero`,
}

const DialoguePage: FC = () => {
	return <DialogueClientPage />
}

export default DialoguePage
