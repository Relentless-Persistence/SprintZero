import {Button, Drawer, Input} from "antd"
import {nanoid} from "nanoid"
import {useEffect, useState} from "react"
import {useFieldArray, useForm} from "react-hook-form"

import type {FC} from "react"
import type {Promisable} from "type-fest"
import type {RetrospectiveItem} from "~/types/db/RetrospectiveItems"

import RhfCheckbox from "~/components/rhf/RhfCheckbox"
import RhfInput from "~/components/rhf/RhfInput"
import RhfSegmented from "~/components/rhf/RhfSegmented"
import RhfTextArea from "~/components/rhf/RhfTextArea"
import {retrospectiveTabs} from "~/types/db/RetrospectiveItems"

type FormInputs = Omit<RetrospectiveItem, `productId` | `userId`>

export type RetrospectiveDrawerProps = {
	initialValues: FormInputs
	onCancel: () => void
	onCommit: (values: FormInputs) => Promisable<void>
}

const RetrospectiveDrawer: FC<RetrospectiveDrawerProps> = ({initialValues, onCancel, onCommit}) => {
	const [isOpen, setIsOpen] = useState(false)
	useEffect(() => setIsOpen(true), [])

	const {control, handleSubmit} = useForm<FormInputs>({
		mode: `onChange`,
		defaultValues: initialValues,
	})

	const {fields: proposedActions, append: newAction} = useFieldArray({control, name: `proposedActions`})
	const [newProposedActionInput, setNewProposedActionInput] = useState(``)

	const onSubmit = handleSubmit((data) => {
		setIsOpen(false)
		setTimeout(() => {
			Promise.resolve(onCommit(data)).catch(console.error)
		}, 300)
	})

	return (
		<Drawer
			title="Retrospective Item"
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
					<Button size="small" type="primary" htmlType="submit" form="retrospective-form">
						Done
					</Button>
				</div>
			}
			height={500}
			open={isOpen}
			closable={false}
			maskClosable={false}
		>
			<form
				id="retrospective-form"
				onSubmit={(e) => {
					onSubmit(e).catch(console.error)
				}}
				className="grid h-full grid-cols-[2fr_1fr] gap-8"
			>
				{/* Left column */}
				<div className="flex h-full flex-col gap-6">
					<div className="flex gap-4">
						<div className="flex grow flex-col gap-2">
							<p className="text-lg font-semibold">Title</p>
							<RhfInput control={control} name="title" />
						</div>

						<div className="flex flex-col gap-2">
							<p className="text-lg font-semibold">Category</p>
							<RhfSegmented
								control={control}
								name="type"
								options={Object.entries(retrospectiveTabs).map(([value, label]) => ({label, value}))}
							/>
						</div>
					</div>

					<div className="flex grow flex-col gap-2">
						<p className="text-lg font-semibold">Description</p>
						<RhfTextArea control={control} name="description" className="grow !resize-none" />
					</div>
				</div>

				{/* Right column */}
				<div className="flex h-full flex-col">
					<div className="flex flex-col gap-2">
						<p className="text-lg font-semibold">Proposed Actions</p>
						<ul>
							{proposedActions.map((action, i) => (
								<li key={action.id} className="mb-1">
									<RhfCheckbox control={control} name={`proposedActions.${i}.checked`}>
										{action.label}
									</RhfCheckbox>
								</li>
							))}
							<li>
								<Input
									size="small"
									value={newProposedActionInput}
									onChange={(e) => setNewProposedActionInput(e.target.value)}
									placeholder="New item"
									onKeyDown={(e) => {
										if (e.key === `Enter`) {
											e.preventDefault()
											newAction({id: nanoid(), label: newProposedActionInput, checked: false})
											setNewProposedActionInput(``)
										}
									}}
									className="w-48"
								/>
							</li>
						</ul>
					</div>
				</div>
			</form>
		</Drawer>
	)
}

export default RetrospectiveDrawer
