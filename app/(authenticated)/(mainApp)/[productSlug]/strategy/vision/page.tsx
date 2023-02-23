import type {Metadata} from "next"
import type {FC} from "react"

import VisionsClientPage from "./client"
export const metadata: Metadata = {
	title: `Vision | SprintZero`,
}

const VisionsPage: FC = () => {
	return <VisionsClientPage />
}

export default VisionsPage
