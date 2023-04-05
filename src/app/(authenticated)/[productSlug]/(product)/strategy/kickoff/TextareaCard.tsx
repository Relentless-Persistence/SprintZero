import { Button, Card, Empty, Input } from "antd"
import { useState } from "react"

import type { FC } from "react"
import type { Promisable } from "type-fest"

import StretchyTextArea from "~/components/StretchyTextArea"

export type TextareaCardProps = {
	title: string
	text: string | undefined
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
	onCommit: (text: string) => Promisable<void>
}

const TextareaCard: FC<TextareaCardProps> = ({ title, text, isEditing, onEditStart, onEditEnd, onCommit }) => {
	const [textDraft, setTextDraft] = useState(text ?? ``)

	return (
		<Card
			type="inner"
			title={title}
			onClick={(e) => e.stopPropagation()}
		>
			{
				<Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }}
					value={textDraft} onChange={(e) => setTextDraft(e.target.value)}
					onBlur={() => {
						Promise.resolve(onCommit(textDraft)).catch(console.error)
					}}
				/>
			}
		</Card>
	)
}

export default TextareaCard
