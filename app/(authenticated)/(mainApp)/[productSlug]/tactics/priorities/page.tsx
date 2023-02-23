import type {Metadata} from "next"
import type {FC} from "react"

import PrioritiesClientPage from "./client"
export const metadata: Metadata = {
	title: `Priorities | SprintZero`,
}

const PrioritiesPage: FC = () => {
	return <PrioritiesClientPage />
}

export default PrioritiesPage
