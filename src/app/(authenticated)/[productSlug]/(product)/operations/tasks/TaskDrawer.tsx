import {useQueries} from "@tanstack/react-query"
import {Button, Checkbox, Drawer, Input} from "antd"
import {doc, getDoc} from "firebase/firestore"
import {nanoid} from "nanoid"
import {useEffect, useState} from "react"
import {useDocumentData} from "react-firebase-hooks/firestore"
import {useFieldArray, useForm} from "react-hook-form"

import type {Dayjs} from "dayjs"
import type {QueryDocumentSnapshot} from "firebase/firestore"
import type {FC} from "react"
import type {Promisable} from "type-fest"
import type {Task} from "~/types/db/Tasks"
import type {User} from "~/types/db/Users"

import RhfCheckbox from "~/components/rhf/RhfCheckbox"
import RhfDateTimePicker from "~/components/rhf/RhfDateTimePicker"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSelect from "~/components/rhf/RhfSelect"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import {ProductConverter} from "~/types/db/Products"
import {UserConverter} from "~/types/db/Users"
import {db} from "~/utils/firebase"
import {useActiveProductId} from "~/utils/useActiveProductId"

type FormInputs = Omit<Task, `productId` | `dueDate`> & {dueDate: Dayjs}

export type TaskDrawerProps = {
	initialValues: FormInputs
	onCancel: () => void
	onCommit: (values: FormInputs) => Promisable<void>
}

const TaskDrawer: FC<TaskDrawerProps> = ({initialValues, onCancel, onCommit}) => {
	const [isOpen, setIsOpen] = useState(false)
	useEffect(() => setIsOpen(true), [])

	const activeProductId = useActiveProductId();
	const [product] = useDocumentData(doc(db, `Products`, activeProductId).withConverter(ProductConverter))

	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: initialValues,
	})

	const {fields: subtasks, append: newSubtask} = useFieldArray({control, name: `subtasks`})
	const [newActionInput, setNewActionInput] = useState(``)

	const onSubmit = handleSubmit((data) => {
		setIsOpen(false)
		setTimeout(() => {
			Promise.resolve(onCommit(data)).catch(console.error)
		}, 300)
	})

	const teamMembers = useQueries({
		queries: Object.keys(product?.members ?? {}).map((userId) => ({
			queryKey: [`user`, userId],
			queryFn: async () => await getDoc(doc(db, `Users`, userId).withConverter(UserConverter)),
		})),
	})

	return (
		<Drawer
			title="Task"
			placement="bottom"
			extra={
				<div className="flex items-center gap-2">
					<Button
						onClick={() => {
							setIsOpen(false)
							setTimeout(onCancel, 300)
						}}
					>
						Cancel
					</Button>
					<Button type="primary" htmlType="submit" form="task-form">
						Done
					</Button>
				</div>
			}
			height={400}
			open={isOpen}
			closable={false}
			maskClosable={false}
		>
			<form
				id="task-form"
				onSubmit={(e) => {
					onSubmit(e).catch(console.error)
				}}
				className="grid h-full grid-cols-3 gap-8"
			>
				{/* Column 1 */}
				<div className="flex h-full flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Title</p>
						<RhfInput control={control} name="title" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Notes</p>
						<RhfTextArea control={control} name="notes" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Assign</p>
						<RhfSelect
							control={control}
							name="assigneeIds"
							mode="multiple"
							options={teamMembers
								.map(({data: memberDoc}) => memberDoc)
								.filter((user): user is QueryDocumentSnapshot<User> => user?.exists() ?? false)
								.map((user) => ({label: user.data().name, value: user.id}))}
						/>
					</div>
				</div>

				{/* Column 2 */}
				<div className="flex h-full flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Due Date / Time</p>
						<RhfDateTimePicker control={control} name="dueDate" />
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Subtasks</p>
						{subtasks.map((action, i) => (
							<RhfCheckbox key={action.id} control={control} name={`subtasks.${i}.checked`}>
								{action.name}
							</RhfCheckbox>
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
										newSubtask({
											id: nanoid(),
											checked: false,
											name: newActionInput,
										})
										setNewActionInput(``)
									}
								}}
							/>
						</Checkbox>
					</div>
				</div>

				{/* Column 3 */}
				<div className="flex h-full flex-col gap-6"></div>
			</form>
		</Drawer>
	)
}

export default TaskDrawer
