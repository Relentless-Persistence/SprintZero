import type {Metadata} from "next"
import type {FC} from "react"

import TasksClientPage from "./client"

export const metadata: Metadata = {
	title: `Tasks | SprintZero`,
}

const TasksPage: FC = () => {
	return <TasksClientPage />
}

export default TasksPage
