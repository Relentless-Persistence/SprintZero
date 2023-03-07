import {Button, Card, Empty, Input} from "antd"
import {useState} from "react"

import type {FC} from "react"
import type {Promisable} from "type-fest"

import TextListEditor from "~/components/TextListEditor"

export type EditableListCardProps = {
	isEditing: boolean
	onEditStart: () => void
	title: string
	list: Array<{id: string; text: string}>
	onCancel: () => void
	onCommit: (title: string, list: Array<{id: string; text: string}>) => Promisable<void>
	onDelete?: () => void
}

const EditableListCard: FC<EditableListCardProps> = ({
	isEditing,
	onEditStart,
	title,
	list,
	onCancel,
	onCommit,
	onDelete,
}) => {
	const [titleDraft, setTitleDraft] = useState(title)
	const [listDraft, setListDraft] = useState(list)

	return (
		<Card
			title={
				isEditing ? (
					<Input size="small" value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} className="mr-4" />
				) : (
					<p>{title}</p>
				)
			}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => onCancel()}>
							Cancel
						</Button>
						<Button
							size="small"
							type="primary"
							onClick={() => {
								Promise.resolve(
									onCommit(
										titleDraft,
										listDraft.filter((item) => item.text !== ``),
									),
								).catch(console.error)
							}}
						>
							Done
						</Button>
					</div>
				) : (
					<Button type="text" onClick={() => onEditStart()}>
						Edit
					</Button>
				)
			}
		>
			{isEditing ? (
				<div className="flex flex-col gap-2">
					<TextListEditor textList={listDraft} onChange={setListDraft} />
					{onDelete && (
						<Button danger onClick={() => onDelete()} className="w-full">
							Remove
						</Button>
					)}
				</div>
			) : list.length === 0 ? (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
			) : (
				<ol className="list-decimal pl-4">
					{list.map((item) => (
						<li key={item.id}>{item.text}</li>
					))}
				</ol>
			)}
		</Card>
	)
}

export default EditableListCard
