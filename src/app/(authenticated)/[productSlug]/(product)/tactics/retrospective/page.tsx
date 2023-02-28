import type {FC} from "react"

import RetrospectiveClientPage from "./client"
export const metadata = {
	title: `Retrospective | SprintZero`,
}

const RetrospectivePage: FC = () => {
	return <RetrospectiveClientPage />
}

export default RetrospectivePage
