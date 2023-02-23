import type {Metadata} from "next"
import type {FC} from "react"

import HuddleClientPage from "./client"

export const metadata: Metadata = {
	title: `Huddle | SprintZero`,
}

const HuddlePage: FC = () => {
	return <HuddleClientPage />
}

export default HuddlePage
