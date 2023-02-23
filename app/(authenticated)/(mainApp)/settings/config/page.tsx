import type {Metadata} from "next"
import type {FC} from "react"

import ConfigSettingsClientPage from "./client"
export const metadata: Metadata = {
	title: `Config Settings | SprintZero`,
}

const ConfigSettingsPage: FC = () => {
	return <ConfigSettingsClientPage />
}

export default ConfigSettingsPage
