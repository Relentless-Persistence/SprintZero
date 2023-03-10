"use client"

import {PlusOutlined} from "@ant-design/icons"
import {Breadcrumb, FloatButton, Tabs} from "antd"
import dayjs from "dayjs"
import {Timestamp, addDoc, collection, doc, query, updateDoc, where} from "firebase/firestore"
import {useState} from "react"
import {useCollection} from "react-firebase-hooks/firestore"

import type {ComponentProps, FC} from "react"

import TaskColumn from "./TaskColumn"
import TaskDrawer from "./TaskDrawer"
import {useAppContext} from "~/app/(authenticated)/[productSlug]/AppContext"
import {TaskConverter} from "~/types/db/Products/Tasks"

const TasksClientPage: FC = () => {
	const {product} = useAppContext()
	const [activeBoard, setActiveBoard] = useState(`one`)
	const [editingTask, setEditingTask] = useState<string | `new` | undefined>(undefined)

	const [tasks, loading] = useCollection(
		query(collection(product.ref, `Tasks`), where(`board`, `==`, activeBoard)).withConverter(TaskConverter),
	)

	return (
		<div className="grid h-full grid-cols-[1fr_max-content]">
			<div className="relative flex h-full w-full flex-col overflow-auto pb-8">
				<div className="sticky left-0 flex w-full justify-between px-12 py-8">
					<Breadcrumb>
						<Breadcrumb.Item>Operations</Breadcrumb.Item>
						<Breadcrumb.Item>Tasks</Breadcrumb.Item>
						<Breadcrumb.Item className="capitalize">{activeBoard}</Breadcrumb.Item>
					</Breadcrumb>
				</div>

				<div className="ml-12 grid grow auto-cols-[286px] grid-flow-col gap-4">
					{tasks && (
						<>
							<TaskColumn id="todo" title="To Do" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
							<TaskColumn id="inProgress" title="In Progress" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
							<TaskColumn id="review" title="Review" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
							<TaskColumn id="done" title="Done" tasks={tasks} onEdit={(id) => setEditingTask(id)} />
						</>
					)}

					{/* Spacer */}
					<div className="w-8" />
				</div>

				<FloatButton
					icon={<PlusOutlined />}
					tooltip="Add Item"
					onClick={() => setEditingTask(`new`)}
					className="fixed bottom-8 right-24"
				/>
			</div>

			<Tabs
				tabPosition="right"
				activeKey={activeBoard}
				onChange={(key) => setActiveBoard(key)}
				items={[
					{key: `one`, label: `One`},
					{key: `two`, label: `Two`},
					{key: `three`, label: `Three`},
					{key: `four`, label: `Four`},
					{key: `five`, label: `Five`},
				]}
			/>

			{editingTask && !loading && (
				<TaskDrawer
					initialValues={(() => {
						let initialValues: ComponentProps<typeof TaskDrawer>["initialValues"]
						if (editingTask === `new`) {
							initialValues = {
								board: activeBoard,
								dueDate: dayjs(),
								notes: ``,
								status: `todo`,
								subtasks: [],
								title: ``,
								assigneeIds: [],
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
							await addDoc(collection(product.ref, `Tasks`).withConverter(TaskConverter), {
								...data,
								dueDate: Timestamp.fromMillis(data.dueDate.valueOf()),
								board: activeBoard,
							})
						} else {
							await updateDoc(doc(product.ref, `Tasks`, editingTask).withConverter(TaskConverter), {
								...data,
								dueDate: Timestamp.fromMillis(data.dueDate.valueOf()),
							})
						}
						setEditingTask(undefined)
					}}
				/>
			)}
		</div>
	)
}

export default TasksClientPage
