import { Button, Checkbox, DatePicker, Drawer, Input, Select } from "antd"
import dayjs from "dayjs"
import { Timestamp, addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { nanoid } from "nanoid"
import { useEffect, useState } from "react"
import { useErrorHandler } from "react-error-boundary"
import { useCollection } from "react-firebase-hooks/firestore"

import type { DatePickerProps } from 'antd';
import type { Dayjs } from "dayjs"
import type { FC } from "react"
import type { Task } from "~/types/db/Products/Tasks";

import Comments from "./Comment"
import { useAppContext } from "~/app/(authenticated)/[productSlug]/AppContext"
import { MemberConverter } from "~/types/db/Products/Members"
// import { TaskConverter } from "~/types/db/Products/Tasks"

const dateFormat = `MMMM D, YYYY`;

interface Subtask {
	id: string;
	checked: boolean;
	name: string;
}

interface MyTask extends Task {
	id: string
}

export type TaskDrawerProps = {
	isOpen: boolean;
	setNewTask: (isOpen: boolean) => void;
	data?: MyTask | null;
	type?: string;
};

const TaskDrawer: FC<TaskDrawerProps> = ({ isOpen, setNewTask, data, type }) => {
	const { product } = useAppContext()
	const [title, setTitle] = useState<string>(``)
	const [notes, setNotes] = useState<string>(``)
	const [assign, setAssign] = useState<string[]>([])
	const [dueDate, setDueDate] = useState<Dayjs | null>()
	const [subtasks, setSubtasks] = useState<Subtask[]>([])

	useEffect(() => {
		if (data) {
			setTitle(data.title)
			setNotes(data.notes ?? notes)
			setAssign(data.assigneeIds ?? assign)
			setDueDate(dayjs(data.dueDate?.toMillis()) ?? dueDate)
			setSubtasks(data.subtasks ?? subtasks)
		}
	}, [data])

	const [members, , membersError] = useCollection(collection(product.ref, `Members`).withConverter(MemberConverter))
	useErrorHandler(membersError)

	const [newActionInput, setNewActionInput] = useState(``)

	const onSubmit = async () => {
		const updatedTask = {
			title,
			notes,
			assigneeIds: assign,
			subtasks,
			dueDate: Timestamp.fromDate(dayjs(dueDate).toDate()),
		}
		if (data) {
			await updateDoc(doc(product.ref, `Tasks`, data.id), {
				...updatedTask,
			})
		} else {
			await addDoc(collection(product.ref, `Tasks`), {
				title,
				notes,
				assigneeIds: assign,
				subtasks,
				dueDate: Timestamp.fromDate(dayjs(dueDate).toDate()),
				type,
				status: `todo`
			})
		}
		setNewTask(false)
	}

	const onChangeDate: DatePickerProps['onChange'] = (date) => {
		setDueDate(dayjs(date, dateFormat))
	}

	const onChangeSubtask = (index: number): void => {
		const newSubtasks = [...subtasks]
		if (newSubtasks[index]) {
			newSubtasks[index]!.checked = !newSubtasks[index]!.checked;
			setSubtasks(newSubtasks);
		}
	}

	const deleteTask = async (): Promise<void> => {
		if (data) {
			const taskRef = doc(product.ref, `Tasks`, data.id);
			try {
				await deleteDoc(taskRef);
				setNewTask(false)
			} catch (error) {
				console.error(`Error deleting task: `, error);
			}
		}
	};

	return (
		<Drawer
			title={data ? <Button type="primary" size="small" danger onClick={() => {
				deleteTask().catch(console.error)
			}}>Delete</Button> : `New Task`}
			placement="bottom"
			extra={
				<div className="flex items-center gap-2">
					<Button
						onClick={() => {
							setNewTask(false)
						}}
					>
						Cancel
					</Button>
					<Button type="primary" onClick={(e) => {
						e.preventDefault()
						onSubmit().catch(console.error)
					}}>
						Done
					</Button>
				</div>
			}
			height={400}
			open={isOpen}
			closable={false}
			maskClosable={false}
		>
			<div className="grid h-full grid-cols-3 gap-8">
				{/* Column 1 */}
				<div className="flex h-full flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Title</p>
						<Input value={title} onChange={e => setTitle(e.target.value)} name="title" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Notes</p>
						<Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} name="notes" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Assign</p>
						<Select
							value={assign}
							onChange={(value) => setAssign(value)}
							mode="multiple"
							options={members?.docs.map((user) => ({ label: user.data().name, value: user.id }))}
						/>
					</div>
				</div>

				{/* Column 2 */}
				<div className="flex h-full flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Due Date / Time</p>
						<DatePicker value={dueDate} format={dateFormat} onChange={onChangeDate} />
						{/* <TimePicker /> */}
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Subtasks</p>
						{subtasks.map((action, i) => (
							<Checkbox key={action.id} checked={action.checked} onChange={() => onChangeSubtask(i)}>
								{action.name}
							</Checkbox>
						))}
						<Checkbox disabled>
							<Input
								size="small"
								placeholder="Add new"
								value={newActionInput}
								onChange={(e) => setNewActionInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === `Enter`) {
										e.preventDefault()
										setSubtasks([...subtasks, {
											id: nanoid(),
											checked: false,
											name: newActionInput,
										}])
										setNewActionInput(``)
									}
								}}
							/>
						</Checkbox>
					</div>
				</div>

				{/* Column 3 */}
				{data ? <div className="flex h-full flex-col gap-6">
					<p className="text-lg font-semibold">Comments</p>
					<Comments id={data.id} />
				</div> : null}
			</div>

		</Drawer>
	)
}

export default TaskDrawer
