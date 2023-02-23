import type {Metadata} from "next"
import type {FC} from "react"

import KickoffClientPage from "./client"
export const metadata: Metadata = {
	title: `Kickoff | SprintZero`,
}

const KickoffPage: FC = () => {
	return <KickoffClientPage />
}

export default KickoffPage
