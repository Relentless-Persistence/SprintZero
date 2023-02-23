import type {Metadata} from "next"
import type {FC} from "react"

import AccountSettingsClientPage from "./client"
export const metadata: Metadata = {
	title: `Account Settings | SprintZero`,
}

const AccountSettingsPage: FC = () => {
	return <AccountSettingsClientPage />
}

export default AccountSettingsPage
