"use client"

import {Breadcrumb, Button, Card, Tabs} from "antd"
import {collection, query, Timestamp, where} from "firebase/firestore"
import {useState} from "react"
import {useCollectionData} from "react-firebase-hooks/firestore"

import type {FC} from "react"
import type {Id} from "~/types"

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
					<Card type="inner" title="Backlog"></Card>
					<Card type="inner" title="Doing"></Card>
					<Card type="inner" title="Review"></Card>
					<Card type="inner" title="Done"></Card>

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
					initialValues={
						editingTask === `new`
							? {
									actions: [],
									board: `backlog`,
									description: ``,
									dueDate: Timestamp.now(),
									title: ``,
							  }
							: tasks!.find((task) => task.id === editingTask)!
					}
					onCancel={() => void setEditingTask(undefined)}
					onCommit={() => void setEditingTask(undefined)}
				/>
			)}
		</div>
	)
}

export default TasksPage
