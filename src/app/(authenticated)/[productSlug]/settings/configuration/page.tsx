import type {FC} from "react"

import ConfigurationSettingsClientPage from "./client"
export const metadata = {
	title: `Configuration Settings | SprintZero`,
}

const ConfigurationSettingsPage: FC = () => {
	return <ConfigurationSettingsClientPage />
}

export default ConfigurationSettingsPage
