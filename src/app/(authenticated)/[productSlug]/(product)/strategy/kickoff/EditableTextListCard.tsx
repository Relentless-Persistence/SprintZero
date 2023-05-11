import { Button, Card, Empty } from "antd"
import { useState } from "react"

import type { FC } from "react"
import type { Promisable } from "type-fest"

import TextListEditor from "~/components/TextListEditor"

export type EditableTextListCardProps = {
	title: string
	textList: Array<{ id: string; text: string }> | undefined
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
	onCommit: (textList: Array<{ id: string; text: string }>) => Promisable<void>
}

const EditableTextListCard: FC<EditableTextListCardProps> = ({
	title,
	textList,
	isEditing,
	onEditStart,
	onEditEnd,
	onCommit,
}) => {
	const [draftTextList, setDraftTextList] = useState<Array<{ id: string; text: string }>>([])

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
								Promise.resolve(onCommit(draftTextList.filter((item) => item.text.trim() !== ``)))
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
							setDraftTextList(textList || [])
							onEditStart()
						}}
					>
						Edit
					</Button>
				)
			}
		>
			{isEditing ? (
				<TextListEditor textList={draftTextList} onChange={setDraftTextList} />
			) : textList && textList.length > 0 ? (
				<ol className="list-decimal pl-4">
					{textList.map((item) => (
						<li key={item.id}>{item.text}</li>
					))}
				</ol>
			) : (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
			)}
		</Card>
	)
}

export default EditableTextListCard
