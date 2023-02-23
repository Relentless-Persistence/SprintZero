import type {Metadata} from "next"
import type {FC} from "react"

import LearningsClientPage from "./client"
export const metadata: Metadata = {
	title: `Learnings | SprintZero`,
}

const LearningsPage: FC = () => {
	return <LearningsClientPage />
}

export default LearningsPage
