import type {FC} from "react"

import AccountSettingsClientPage from "./client"
export const metadata = {
	title: `Account Settings | SprintZero`,
}

const AccountSettingsPage: FC = () => {
	return <AccountSettingsClientPage />
}

export default AccountSettingsPage
