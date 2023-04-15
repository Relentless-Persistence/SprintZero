import type { FC } from "react"

import ParticipantsClientPage from "./client"
export const metadata = {
    title: `Participants | SprintZero`,
}

const ParticipantsPage: FC = () => {
    return <ParticipantsClientPage />
}

export default ParticipantsPage
