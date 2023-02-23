import type {Metadata} from "next"
import type {FC} from "react"

import TeamSettingsClientPage from "./client"
export const metadata: Metadata = {
	title: `Team Settings | SprintZero`,
}

const TeamSettingsPage: FC = () => {
	return <TeamSettingsClientPage />
}

export default TeamSettingsPage
