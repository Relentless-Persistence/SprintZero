import { CloseCircleOutlined, CloseOutlined, CloudOutlined, MinusCircleOutlined } from "@ant-design/icons"
import { Button, Card, Empty, Input, Space } from "antd"
import { useEffect, useState } from "react"

import type { FC } from "react"
import type { Promisable } from "type-fest"

import TextListEditor from "~/components/TextListEditor"

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
	//console.log("receiving textList:", textList)
	const [draftTextList, setDraftTextList] = useState<Array<{ id: string; text: string }>>([])

	// useEffect(() => {
	// 	if (textList) {
	// 		setDraftTextList(textList)
	// 	}

	// }, [textList])

	return (
		<Card
			type="inner"
			title={title}
		>
			<TextListEditor textList={draftTextList} onChange={
				setDraftTextList
			}

				onBlur={() => {
					Promise.resolve(onCommit(draftTextList.filter((item) => item.text.trim() !== ``)))
						.then(() => {
							onEditEnd()
						})
						.catch(console.error)
				}}
			/>
		</Card>
	)
}

export default TextListCard
