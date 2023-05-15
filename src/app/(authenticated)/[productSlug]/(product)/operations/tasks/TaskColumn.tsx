import { Button, Card, Tag } from "antd"
import dayjs from "dayjs"
import { useState } from "react"

import type { FC } from "react"
import type { Task } from "~/types/db/Products/Tasks"

import TaskDrawer from "./TaskDrawer"

interface MyTask extends Task {
	id: string
}

export type TaskColumnProps = {
	id: string
	title: string
	tasks: MyTask[]
}

const TaskColumn: FC<TaskColumnProps> = ({ id, title, tasks }) => {
	const [editTask, setEditTask] = useState(false)
	const [selectedTask, setSelectedTask] = useState<MyTask | null>(null)

	return (
		<div>
			<Card title={title} className="w-[360px] h-[463px] lg:h-[560px] overflow-y-auto" extra=<Tag>{tasks.length > 0 ? tasks
				.filter((task) => task.status === id).length : 0}</Tag>>
				<div className="flex flex-col gap-4">
					{tasks.length > 0 ? tasks
						.filter((task) => task.status === id)
						.map((task) => (
							<Card
								key={task.id}
								type="inner"
								title={task.title}
								extra={
									<Button size="small" onClick={() => {
										setSelectedTask(task)
										setEditTask(true)
									}}>
										Edit
									</Button>
								}
							>
								<Tag>{dayjs(task.dueDate.toDate()).format(`MMM D [at] HH:mm:ss`)}</Tag>
							</Card>
						)) : null}
				</div>
			</Card>

			{editTask && (
				<TaskDrawer
					isOpen={editTask}
					setNewTask={setEditTask}
					data={selectedTask}
				/>
			)}
		</div>
	)
}

export default TaskColumn
