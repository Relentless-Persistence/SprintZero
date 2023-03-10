import {Button, Card, Tag} from "antd"
import dayjs from "dayjs"

import type {QuerySnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Task} from "~/types/db/Products/Tasks"

export type TaskColumnProps = {
	id: string
	title: string
	tasks: QuerySnapshot<Task>
	onEdit: (id: string) => void
}

const TaskColumn: FC<TaskColumnProps> = ({id, title, tasks, onEdit}) => {
	return (
		<Card title={title}>
			<div className="flex flex-col gap-4">
				{tasks.docs
					.filter((task) => task.data().status === id)
					.map((task) => (
						<Card
							key={task.id}
							type="inner"
							title={task.data().title}
							extra={
								<Button size="small" onClick={() => onEdit(task.id)}>
									Edit
								</Button>
							}
						>
							<Tag>{dayjs(task.data().dueDate.toDate()).format(`MMM D [at] HH:mm:ss`)}</Tag>
						</Card>
					))}
			</div>
		</Card>
	)
}

export default TaskColumn
