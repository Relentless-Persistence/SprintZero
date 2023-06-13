import { ArrowRightOutlined, CopyOutlined, FileTextOutlined, ReadOutlined } from "@ant-design/icons"
import { Button, Card, Tag } from "antd"
import dayjs from "dayjs"
import { doc, updateDoc } from "firebase/firestore"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { createRef, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import type { taskColumns } from "./GeneralTask"
import type { FC } from "react"
import type { StoryMapItem } from "~/types/db/Products/StoryMapItems"
import type { Task } from "~/types/db/Products/Tasks";

import TaskDrawer from "./TaskDrawer"
import { useAppContext } from "../../../AppContext"
import { useStoryMapContext } from "../../map/StoryMapContext"
import { TaskConverter } from "~/types/db/Products/Tasks"

interface MyTask extends Task {
	id: string
}

export type TaskColumnProps = {
	columnName: string
	title: string
	tasks: MyTask[],
	storyMapItems?: StoryMapItem[]

}

const TaskColumn: FC<TaskColumnProps> = ({ columnName, title, tasks, storyMapItems }) => {

	const { product } = useAppContext()
	const [editTask, setEditTask] = useState(false)
	const [selectedTask, setSelectedTask] = useState<MyTask | null>(null)
	const [isBeingDragged, setIsBeingDragged] = useState<string | null>(null)

	//const ref = useRef<HTMLDivElement>(null)

	const refs = useRef<(HTMLDivElement | null)[]>([]);
	refs.current = refs.current.slice(0, tasks.length);


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

	//const onDragStart = () => setIsBeingDragged(true)
	//const onDragEnd = () => setIsBeingDragged(false)

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
			<Card id={columnName} title={title} className="task-column grid min-h-0 grid-rows-[auto_1fr] [&>.ant-card-body]:overflow-auto" extra={<Tag>{tasks.length > 0 ? tasks
				.filter((task) => task.status === columnName).length : 0}</Tag>}>
				<div className="flex flex-col gap-4">
					{tasks.length > 0 ? tasks
						.filter((task) => task.status === columnName)
						.map((task, index) => {

							let storyName = ``
							let featureName = ``
							let epicName = ``

							if (task.type === `acceptanceCriteria` || task.type === `bug`) {
								const selectedStory = storyMapItems?.find(item => task.storyId === item.id);

								// const selectedStoryId = selectedStory?.id;
								storyName = selectedStory?.name ?? ``;
								// const openDrawer = () => {
								//   setStoryId(selectedStoryId)
								//   setViewStory(true)
								// };

								const selectedFeatureId: string = selectedStory?.parentId ?? ``;
								const feature = storyMapItems?.find(story => story.id === selectedFeatureId);
								featureName = feature?.name ?? ``;

								const epic = storyMapItems?.find(story => story.id === feature?.parentId);
								epicName = epic?.name ?? ``;
							}

							return (<>
								<motion.div
									key={task.id}
									layoutId={`board-task-${task.id}`}
									onPointerDown={(e) => e.preventDefault()}
									onPanStart={() => {
										//const rect = ref.current!.getBoundingClientRect()
										const rect = refs.current[index]!.getBoundingClientRect()
										setDragInfo({
											width: rect.width,
											height: rect.height,
											offsetX: pointerPos.current.x - rect.x,
											offsetY: pointerPos.current.y - rect.y,
										})
										setIsBeingDragged(task.id)
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
												setIsBeingDragged(null)
											})
											.catch(console.error)
									}
									}
									onPan={(e, info) => {
										x.set(info.point.x)
										y.set(info.point.y)
									}}
									className="touch-none"
									ref={el => (refs.current[index] = el)}
								>
									<Card
										key={task.id}
										type="inner"
										size="small"
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
										{(task.type === `acceptanceCriteria` || task.type === `bug`) && (
											<div className="flex flex-wrap item-center gap-1">
												<Tag icon={<ReadOutlined />}>{epicName}</Tag>
												<ArrowRightOutlined />
												<Tag icon={<CopyOutlined />}>{featureName}</Tag>
												<ArrowRightOutlined />
												<Tag icon={<FileTextOutlined />}>{storyName}</Tag>
											</div>
										)}

										{task.dueDate && <Tag>{dayjs(task.dueDate.toDate()).format(`MMM D [at] HH:mm:ss`)}</Tag>}
									</Card>
								</motion.div>

								{isBeingDragged === task.id &&
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
												size="small"
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
												{(task.type === `acceptanceCriteria` || task.type === `bug`) && (
													<div className="flex flex-wrap item-center gap-1">
														<Tag icon={<ReadOutlined />}>{epicName}</Tag>
														<ArrowRightOutlined />
														<Tag icon={<CopyOutlined />}>{featureName}</Tag>
														<ArrowRightOutlined />
														<Tag icon={<FileTextOutlined />}>{storyName}</Tag>
													</div>
												)}

												{task.dueDate && <Tag>{dayjs(task.dueDate.toDate()).format(`MMM D [at] HH:mm:ss`)}</Tag>}
											</Card>
										</motion.div>,
										document.body,
									)}
							</>
							)

						}) : null}
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
