import type {Metadata} from "next"
import type {FC} from "react"

import EthicsClientPage from "./client"

export const metadata: Metadata = {
	title: `Ethics | SprintZero`,
}

const EthicsPage: FC = () => {
	return <EthicsClientPage />
}

export default EthicsPage
