import {Card} from "antd"
import dayjs from "dayjs"

import type {FC} from "react"
import type {Id, WithDocumentData} from "~/types"
import type {Task} from "~/types/db/Tasks"

export type TaskColumnProps = {
	id: string
	title: string
	tasks: WithDocumentData<Task>[]
	onEdit: (id: Id) => void
}

const TaskColumn: FC<TaskColumnProps> = ({id, title, tasks, onEdit}) => {
	return (
		<Card type="inner" title={title}>
			<div className="space-y-4">
				{tasks
					.filter((task) => task.board === id)
					.map((task) => (
						<button
							key={task.id}
							type="button"
							onClick={() => void onEdit(task.id)}
							className="w-full space-y-1 border border-laurel bg-[#fafafa] px-4 py-2 text-left"
						>
							<p className="font-medium">{task.title}</p>
							<p className="inline-block border border-[#aee383] bg-[#e1f4d1] px-1 py-0.5 text-xs text-[#315613]">
								{dayjs(task.dueDate.toDate()).format(`MMM D [at] HH:mm:ss`)}
							</p>
						</button>
					))}
			</div>
		</Card>
	)
}

export default TaskColumn
