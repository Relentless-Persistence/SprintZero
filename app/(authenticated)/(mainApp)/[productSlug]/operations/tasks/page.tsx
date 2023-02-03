"use client"

import {Breadcrumb, Button, Tabs} from "antd"
import dayjs from "dayjs"
import {addDoc, collection, doc, query, Timestamp, updateDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC, ComponentProps} from "react"
import type {Id} from "~/types"
import type {Task} from "~/types/db/Tasks"

import TaskColumn from "./TaskColumn"
import TaskDrawer from "./TaskDrawer"
import {TaskConverter, Tasks} from "~/types/db/Tasks"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const TasksPage: FC = () => {
	const [activeBoard, setActiveBoard] = useState(`0`)
	const [editingTask, setEditingTask] = useState<Id | `new` | undefined>(undefined)

	const activeProductId = useActiveProductId()
	const [tasks, loading] = useCollectionData(
		query(collection(db, Tasks._), where(Tasks.productId, `==`, activeProductId)).withConverter(TaskConverter),
	)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="flex h-full w-full flex-col overflow-auto pb-8">
				<div className="sticky left-0 flex w-full justify-between px-12 py-8">
					<Breadcrumb>
						<Breadcrumb.Item>Operations</Breadcrumb.Item>
						<Breadcrumb.Item>Tasks</Breadcrumb.Item>
						<Breadcrumb.Item>Board {activeBoard}</Breadcrumb.Item>
					</Breadcrumb>

					<div>
						<Button className="bg-white" onClick={() => setEditingTask(`new`)}>
							Add New
						</Button>
					</div>
				</div>

				<div className="ml-12 grid grow auto-cols-[16rem] grid-flow-col gap-4">
					{tasks && (
						<>
							<TaskColumn id="backlog" title="Backlog" tasks={tasks} onEdit={(id) => void setEditingTask(id)} />
							<TaskColumn id="doing" title="Doing" tasks={tasks} onEdit={(id) => void setEditingTask(id)} />
							<TaskColumn id="review" title="Review" tasks={tasks} onEdit={(id) => void setEditingTask(id)} />
							<TaskColumn id="done" title="Done" tasks={tasks} onEdit={(id) => void setEditingTask(id)} />
						</>
					)}

					{/* Spacer */}
					<div className="w-8" />
				</div>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={activeBoard}
				onChange={(key) => void setActiveBoard(key)}
				items={[
					{key: `0`, label: `Board 0`},
					{key: `1`, label: `Board 1`},
					{key: `2`, label: `Board 2`},
					{key: `3`, label: `Board 3`},
					{key: `4`, label: `Board 4`},
				]}
			/>

			{editingTask && !loading && (
				<TaskDrawer
					initialValues={(() => {
						let initialValues: ComponentProps<typeof TaskDrawer>["initialValues"]
						if (editingTask === `new`) {
							initialValues = {
								actions: [],
								board: `backlog`,
								description: ``,
								dueDate: dayjs(),
								title: ``,
							}
						} else {
							const task = tasks!.find((task) => task.id === editingTask)!
							initialValues = {
								...task,
								dueDate: dayjs(task.dueDate.toDate()),
							}
						}
						return initialValues
					})()}
					onCancel={() => void setEditingTask(undefined)}
					onCommit={async (data) => {
						if (editingTask === `new`) {
							await addDoc(collection(db, Tasks._), {
								...data,
								dueDate: Timestamp.fromDate(data.dueDate.toDate()),
								productId: activeProductId,
							} satisfies Task)
						} else {
							await updateDoc(doc(db, Tasks._, editingTask), {
								...data,
								dueDate: Timestamp.fromDate(data.dueDate.toDate()),
							} satisfies Partial<Task>)
						}
						setEditingTask(undefined)
					}}
				/>
			)}
		</div>
	)
}

export default TasksPage
