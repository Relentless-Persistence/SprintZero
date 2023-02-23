import type {Metadata} from "next"
import type {FC} from "react"

import PersonasClientPage from "./client"
export const metadata: Metadata = {
	title: `Personas | SprintZero`,
}

const PersonasPage: FC = () => {
	return <PersonasClientPage />
}

export default PersonasPage
