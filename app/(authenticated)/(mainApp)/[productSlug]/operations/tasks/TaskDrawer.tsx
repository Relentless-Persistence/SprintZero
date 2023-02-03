import {Button, Drawer} from "antd"
import {useEffect, useState} from "react"
import {useFieldArray, useForm} from "react-hook-form"

import type {FC} from "react"
import type {Task} from "~/types/db/Tasks"

import RhfInput from "~/components/rhf/RhfInput"
import RhfTextArea from "~/components/rhf/RhfTextArea"

type FormInputs = Omit<Task, `productId`>

export type TaskDrawerProps = {
	initialValues: FormInputs
	onCancel: () => void
	onCommit: (values: FormInputs) => void
}

const TaskDrawer: FC<TaskDrawerProps> = ({initialValues, onCancel, onCommit}) => {
	const [isOpen, setIsOpen] = useState(false)
	useEffect(() => void setIsOpen(true), [])

	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: initialValues,
	})

	const {fields: actions, append: newAction} = useFieldArray({control, name: `actions`})
	const [newActionInput, setNewActionInput] = useState(``)

	const onSubmit = handleSubmit((data) => {
		setIsOpen(false)
		setTimeout(() => void onCommit(data), 300)
	})

	return (
		<Drawer
			title="Task"
			placement="bottom"
			extra={
				<div className="flex items-center gap-2">
					<Button
						size="small"
						onClick={() => {
							setIsOpen(false)
							setTimeout(onCancel, 300)
						}}
					>
						Cancel
					</Button>
					<Button size="small" type="primary" htmlType="submit" form="task-form" className="bg-green-s500">
						Done
					</Button>
				</div>
			}
			height={500}
			open={isOpen}
			closable={false}
			maskClosable={false}
		>
			<form id="task-form" onSubmit={onSubmit} className="grid h-full grid-cols-3 gap-8">
				{/* Column 1 */}
				<div className="flex h-full flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-xl font-semibold text-[#595959]">Title</p>
						<RhfInput control={control} name="title" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-xl font-semibold text-[#595959]">Description</p>
						<RhfTextArea control={control} name="description" />
					</div>
				</div>

				{/* Column 2 */}
				<div className="flex h-full flex-col">
					<div className="flex flex-col gap-2">
						<p className="text-xl font-semibold text-[#595959]">Due</p>
						<RhfInput control={control} name="title" />
					</div>
				</div>

				{/* Column 3 */}
				<div className="flex h-full flex-col"></div>
			</form>
		</Drawer>
	)
}

export default TaskDrawer
