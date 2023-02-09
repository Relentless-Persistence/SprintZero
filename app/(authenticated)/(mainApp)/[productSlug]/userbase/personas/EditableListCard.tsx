import {Button, Card, Input} from "antd"
import {useState} from "react"

import type {FC} from "react"

import TextListEditor from "../../../../../../components/TextListEditor"

export type EditableListCardProps = {
	isEditing: boolean
	onEditStart: () => void
	title: string
	list: Array<{id: string; text: string}>
	onCancel: () => void
	onCommit: (title: string, list: Array<{id: string; text: string}>) => void
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
			type="inner"
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
							className="bg-green"
							onClick={() =>
								onCommit(
									titleDraft,
									listDraft.filter((item) => item.text !== ``),
								)
							}
						>
							Done
						</Button>
					</div>
				) : (
					<button type="button" onClick={() => onEditStart()} className="text-green">
						Edit
					</button>
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
