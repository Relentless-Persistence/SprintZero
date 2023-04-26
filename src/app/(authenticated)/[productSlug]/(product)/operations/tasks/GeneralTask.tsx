
import { useState } from "react"

import type { FC } from "react"
import type { Task } from "~/types/db/Products/Tasks"

import TaskColumn from "./TaskColumn"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"

interface MyTask extends Task {
	id: string
}

interface Props {
	tasks: MyTask[];
}

const GeneralTask: FC<Props> = ({ tasks }) => {
	const { product } = useAppContext()
	const [editingTask, setEditingTask] = useState(false)

	return (
		<div className="">

			<div className="h-full grid grow auto-cols-[286px] grid-flow-col gap-4">


				<TaskColumn id="todo" title="To Do" tasks={tasks} onEdit={() => setEditingTask(true)} />
				<TaskColumn id="inProgress" title="In Progress" tasks={tasks} onEdit={() => setEditingTask(true)} />
				<TaskColumn id="review" title="Review" tasks={tasks} onEdit={() => setEditingTask(true)} />
				<TaskColumn id="done" title="Done" tasks={tasks} onEdit={(id) => setEditingTask(true)} />

			</div>
		</div>
	)
}

export default GeneralTask
