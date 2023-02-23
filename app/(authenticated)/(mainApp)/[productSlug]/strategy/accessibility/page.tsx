import type {Metadata} from "next"
import type {FC} from "react"

import AccessibilityClientPage from "./client"

export const metadata: Metadata = {
	title: `Accessibility | SprintZero`,
}

const AccessibilityPage: FC = () => {
	return <AccessibilityClientPage />
}

export default AccessibilityPage
