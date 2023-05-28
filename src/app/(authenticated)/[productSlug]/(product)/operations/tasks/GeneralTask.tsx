
// import { useState } from "react"

import type { FC } from "react"
import type { Task } from "~/types/db/Products/Tasks"

import TaskColumn from "./TaskColumn"

interface MyTask extends Task {
	id: string
}

interface Props {
	tasks: MyTask[];
}

const GeneralTask: FC<Props> = ({ tasks }) => {
	return (
		<div className="flex h-full w-full grow overflow-x-auto pb-4">
			<div className="grid h-full grid-cols-[repeat(4,20rem)] gap-4">
				{
					Object.entries(taskColumns).map(([columnName, title]) => (
						<TaskColumn
							key={columnName}
							columnName={columnName}
							title={title}
							tasks={tasks}
						/>
					))}

			</div>
			{/* Spacer because padding doesn't work in the overflow */}
			<div className="shrink-0 basis-0" />
		</div>
	)
}

export default GeneralTask

export const taskColumns = {
	todo: `To Do`,
	inProgress: `In Progress`,
	review: `Review`,
	done: `Done`,
}

