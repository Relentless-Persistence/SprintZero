import type {Metadata} from "next"
import type {FC} from "react"

import RetrospectiveClientPage from "./client"
export const metadata: Metadata = {
	title: `Retrospective | SprintZero`,
}

const RetrospectivePage: FC = () => {
	return <RetrospectiveClientPage />
}

export default RetrospectivePage
