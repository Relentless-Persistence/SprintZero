import type {Metadata} from "next"
import type {FC} from "react"

import ObjectivesClientPage from "./client"
export const metadata: Metadata = {
	title: `Objectives | SprintZero`,
}

const ObjectivesPage: FC = () => {
	return <ObjectivesClientPage />
}

export default ObjectivesPage
