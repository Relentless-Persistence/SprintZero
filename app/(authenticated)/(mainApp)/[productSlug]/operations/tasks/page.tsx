"use client"

import {Breadcrumb, Button, Tabs} from "antd"
import dayjs from "dayjs"
import {Timestamp, addDoc, collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {ComponentProps, FC} from "react"
import type {Id} from "~/types"
import type {Task} from "~/types/db/Tasks"

import TaskColumn from "./TaskColumn"
import TaskDrawer from "./TaskDrawer"
import {TaskConverter} from "~/types/db/Tasks"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

const TasksPage: FC = () => {
	const [activeBoard, setActiveBoard] = useState(`0`)
	const [editingTask, setEditingTask] = useState<Id | `new` | undefined>(undefined)

	const activeProductId = useActiveProductId()
	const [tasks, loading] = useCollection(
		query(
			collection(db, `Tasks`),
			where(`productId`, `==`, activeProductId),
			where(`board`, `==`, activeBoard),
		).withConverter(TaskConverter),
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
							<TaskColumn id="backlog" title="Backlog" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
							<TaskColumn id="doing" title="Doing" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
							<TaskColumn id="review" title="Review" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
							<TaskColumn id="done" title="Done" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
						</>
					)}

					{/* Spacer */}
					<div className="w-8" />
				</div>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={activeBoard}
				onChange={(key) => setActiveBoard(key)}
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
								status: `backlog`,
								description: ``,
								dueDate: dayjs(),
								title: ``,
								board: activeBoard,
							}
						} else {
							const task = tasks!.docs.find((task) => task.id === editingTask)!
							initialValues = {
								...task.data(),
								dueDate: dayjs(task.data().dueDate.toDate()),
							}
						}
						return initialValues
					})()}
					onCancel={() => setEditingTask(undefined)}
					onCommit={async (data) => {
						if (editingTask === `new`) {
							await addDoc(collection(db, `Tasks`), {
								...data,
								dueDate: Timestamp.fromMillis(data.dueDate.valueOf()),
								productId: activeProductId,
								board: activeBoard,
							} satisfies Task)
						} else {
							await updateDoc(doc(db, `Tasks`, editingTask), {
								...data,
								dueDate: Timestamp.fromMillis(data.dueDate.valueOf()),
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
