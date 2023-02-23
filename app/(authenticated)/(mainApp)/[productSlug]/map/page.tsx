import type {Metadata} from "next"
import type {FC} from "react"

import StoryMapClientPage from "./client"

export const metadata: Metadata = {
	title: `Story Map | SprintZero`,
}

const StoryMapPage: FC = () => {
	return <StoryMapClientPage />
}

export default StoryMapPage
