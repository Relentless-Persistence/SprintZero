import { Button, Card, Tag } from "antd"
import dayjs from "dayjs"
import { doc, updateDoc } from "firebase/firestore"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import type { taskColumns } from "./GeneralTask"
import type { FC } from "react"
import type { Task } from "~/types/db/Products/Tasks";

import TaskDrawer from "./TaskDrawer"
import { useAppContext } from "../../../AppContext"
import { TaskConverter } from "~/types/db/Products/Tasks"

interface MyTask extends Task {
	id: string
}

export type TaskColumnProps = {
	columnName: string
	title: string
	tasks: MyTask[]
}

const TaskColumn: FC<TaskColumnProps> = ({ columnName, title, tasks }) => {
	const { product } = useAppContext()
	const [editTask, setEditTask] = useState(false)
	const [selectedTask, setSelectedTask] = useState<MyTask | null>(null)
	const [isBeingDragged, setIsBeingDragged] = useState(false)

	const ref = useRef<HTMLDivElement>(null)
	const [dragInfo, setDragInfo] = useState({
		width: 0,
		height: 0,
		offsetX: 0,
		offsetY: 0,
	})

	const x = useMotionValue(0)
	const y = useMotionValue(0)
	const xP = useTransform(x, (x) => x - dragInfo.offsetX)
	const yP = useTransform(y, (y) => y - dragInfo.offsetY)

	const pointerPos = useRef({ x: 0, y: 0 })
	const currentColumn = useRef<keyof typeof taskColumns | undefined>(undefined)

	const onDragStart = () => setIsBeingDragged(true)
	const onDragEnd = () => setIsBeingDragged(false)

	useEffect(() => {
		const onPointerMove = (e: PointerEvent) => {
			pointerPos.current = { x: e.clientX, y: e.clientY }
			currentColumn.current = Array.from(document.querySelectorAll(`.task-column`)).find((column) =>
				column.contains(e.target as Node | null),
			)?.id as keyof typeof taskColumns | undefined
			//console.log(`currCol`, currentColumn)
			//console.log(`pointer: `, pointerPos.current)
		}

		window.addEventListener(`pointermove`, onPointerMove)
		return () => {
			window.removeEventListener(`pointermove`, onPointerMove)
		}
	}, [])

	return (
		<>
			<Card id={columnName} title={title} className="task-column w-[360px] h-[463px] lg:h-[560px] overflow-y-auto" extra={<Tag>{tasks.length > 0 ? tasks
				.filter((task) => task.status === columnName).length : 0}</Tag>}>
				<div className="flex flex-col gap-4">
					{tasks.length > 0 ? tasks
						.filter((task) => task.status === columnName)
						.map((task) => (
							<>
								<motion.div
									key={task.id}
									layoutId={`board-task-${task.id}`}
									onPointerDown={(e) => e.preventDefault()}
									onPanStart={() => {
										const rect = ref.current!.getBoundingClientRect()
										setDragInfo({
											width: rect.width,
											height: rect.height,
											offsetX: pointerPos.current.x - rect.x,
											offsetY: pointerPos.current.y - rect.y,
										})
										onDragStart()
									}}
									onPanEnd={() => {

										// const dSTasks: MyTask[] = tasks
										// ? tasks.docs
										//   .map((doc) => ({ id: doc.id, ...doc.data() }))
										//   .filter((task) => task.type === `data science`)
										// : [];

										updateDoc(doc(product.ref, `Tasks`, task.id).withConverter(TaskConverter), {
											status: currentColumn.current,
										})
											.then(() => {
												onDragEnd()
											})
											.catch(console.error)
									}
									}
									onPan={(e, info) => {
										x.set(info.point.x)
										y.set(info.point.y)
									}}
									className="touch-none"
									ref={ref}
								>
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
								</motion.div>

								{isBeingDragged &&
									createPortal(
										<motion.div
											key={`${task.id}-dragging`}
											layoutId={`board-task-${task.id}`}
											className="pointer-events-none fixed"
											transition={{ duration: 0 }}
											style={{ left: xP, top: yP, width: dragInfo.width, height: dragInfo.height }}
										>
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
										</motion.div>,
										document.body,
									)}
							</>

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
		</>
	)
}

export default TaskColumn
