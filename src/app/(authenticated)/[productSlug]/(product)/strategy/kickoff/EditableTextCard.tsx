import {Button, Card, Empty} from "antd"
import {useState} from "react"

import type {FC} from "react"
import type {Promisable} from "type-fest"

import StretchyTextArea from "~/components/StretchyTextArea"

export type EditableTextCardProps = {
	title: string
	text: string | undefined
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
	onCommit: (text: string) => Promisable<void>
}

const EditableTextCard: FC<EditableTextCardProps> = ({title, text, isEditing, onEditStart, onEditEnd, onCommit}) => {
	const [textDraft, setTextDraft] = useState(text ?? ``)

	return (
		<Card
			type="inner"
			title={title}
			extra={
				isEditing ? (
					<div className="ml-4 flex gap-2">
						<Button size="small" onClick={() => onEditEnd()}>
							Cancel
						</Button>
						<Button
							size="small"
							type="primary"
							onClick={() => {
								Promise.resolve(onCommit(textDraft))
									.then(() => {
										onEditEnd()
									})
									.catch(console.error)
							}}
						>
							Done
						</Button>
					</div>
				) : (
					<Button
						size="small"
						onClick={() => {
							setTextDraft(text ?? ``)
							onEditStart()
						}}
					>
						Edit
					</Button>
				)
			}
		>
			{isEditing ? (
				<StretchyTextArea value={textDraft} onChange={(e) => setTextDraft(e.target.value)} />
			) : text ? (
				<p className="min-w-0">{text}</p>
			) : (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
			)}
		</Card>
	)
}

export default EditableTextCard
