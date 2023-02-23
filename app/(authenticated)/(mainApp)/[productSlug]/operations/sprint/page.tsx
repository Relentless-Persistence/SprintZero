import type {Metadata} from "next"
import type {FC} from "react"

import SprintClientPage from "./client"

export const metadata: Metadata = {
	title: `Sprint | SprintZero`,
}

const SprintPage: FC = () => {
	return <SprintClientPage />
}

export default SprintPage
