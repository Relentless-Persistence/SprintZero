import type {Metadata} from "next"
import type {FC} from "react"

import JourneysClientPage from "./client"
export const metadata: Metadata = {
	title: `Journeys | SprintZero`,
}

const JourneysPage: FC = () => {
	return <JourneysClientPage />
}

export default JourneysPage
