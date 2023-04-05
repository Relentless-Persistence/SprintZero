import { Button, Card, Empty, Input, Space } from "antd"
import { useState } from "react"

import type { FC } from "react"
import type { Promisable } from "type-fest"

import TextListEditor from "~/components/TextListEditor"
import { CloseCircleOutlined, CloseOutlined, CloudOutlined, MinusCircleOutlined } from "@ant-design/icons"

export type TextListCardProps = {
	title: string
	textList: Array<{ id: string; text: string }> | undefined
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
	onCommit: (textList: Array<{ id: string; text: string }>) => Promisable<void>
}

const TextListCard: FC<TextListCardProps> = ({
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
			onBlur={() => {
				Promise.resolve(onCommit(draftTextList.filter((item) => item.text.trim() !== ``)))
					.then(() => {
						onEditEnd()
					})
					.catch(console.error)
			}}
		>
			<TextListEditor textList={draftTextList} onChange={setDraftTextList} />
		</Card>
	)
}

export default TextListCard
