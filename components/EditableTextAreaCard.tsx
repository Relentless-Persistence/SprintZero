import {Button, Card, Input} from "antd"
import {useState} from "react"

import type {FC} from "react"

import StretchyInput from "./StretchyInput"

export type EditableTextAreaCardProps = {
	isEditing: boolean
	onEditStart?: () => void
	title: string
	disableTitleEditing?: boolean
	text: string
	onCancel: () => void
	onCommit: (title: string, text: string) => void
	onDelete?: () => void
}

const EditableTextAreaCard: FC<EditableTextAreaCardProps> = ({
	isEditing,
	onEditStart,
	title,
	disableTitleEditing = false,
	text,
	onCancel,
	onCommit,
	onDelete,
}) => {
	const [titleDraft, setTitleDraft] = useState(title)
	const [textDraft, setTextDraft] = useState(text)

	return (
		<Card
			type="inner"
			title={
				isEditing && !disableTitleEditing ? (
					<Input
						size="small"
						value={titleDraft}
						onChange={(e) => void setTitleDraft(e.target.value)}
						className="mr-4"
					/>
				) : (
					<p>{title}</p>
				)
			}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => void onCancel()}>
							Cancel
						</Button>
						<Button
							size="small"
							type="primary"
							className="bg-green"
							onClick={() => void onCommit(titleDraft, textDraft)}
						>
							Done
						</Button>
					</div>
				) : (
					<button type="button" onClick={() => void onEditStart?.()} className="text-green">
						Edit
					</button>
				)
			}
		>
			{isEditing ? (
				<div className="space-y-2">
					<StretchyInput text={textDraft} className="py-[4px] px-[11px]">
						<Input.TextArea
							value={textDraft}
							onChange={(e) => void setTextDraft(e.target.value)}
							className="!resize-none overflow-hidden"
						/>
					</StretchyInput>
					{onDelete && (
						<Button danger onClick={() => void onDelete()} className="w-full">
							Remove
						</Button>
					)}
				</div>
			) : (
				<p className="min-w-0">{textDraft}</p>
			)}
		</Card>
	)
}

export default EditableTextAreaCard
