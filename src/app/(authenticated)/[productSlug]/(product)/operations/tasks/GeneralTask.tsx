
// import { useState } from "react"

import type { FC } from "react"
import type { Task } from "~/types/db/Products/Tasks"

import TaskColumn from "./TaskColumn"
// import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"

interface MyTask extends Task {
	id: string
}

interface Props {
	tasks: MyTask[];
}

const GeneralTask: FC<Props> = ({ tasks }) => {

	return (
		<div className="">

			<div className="h-full grid grow auto-cols-[360px] grid-flow-col gap-4 mb-2 overflow-x-auto">
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

