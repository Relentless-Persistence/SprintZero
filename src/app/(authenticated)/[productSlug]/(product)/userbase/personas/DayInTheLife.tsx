import {Button, Card, Empty, Timeline} from "antd"
import {useState} from "react"

import type {FC} from "react"
import type {Promisable} from "type-fest"

import TextListEditor from "~/components/TextListEditor"

export type EditableListCardProps = {
	title: string
	list: Array<{id: string; text: string}>
	isEditing: boolean
	onEditStart: () => void
	onEditEnd: () => void
	onCommit: (list: Array<{id: string; text: string}>) => Promisable<void>
}

interface Ditl {
	children: string
}

const DayInTheLife: FC<EditableListCardProps> = ({title, list, isEditing, onEditStart, onEditEnd, onCommit}) => {
	const [listDraft, setListDraft] = useState(list)

	const items = () => {
		const data: Ditl[] = []
		list.map((item) => {
			data.push({
				children: item.text,
			})
		})
		return data
	}

	return (
		<Card
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
								Promise.resolve(onCommit(listDraft.filter((item) => item.text !== ``))).catch(console.error)
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
				</div>
			) : list.length === 0 ? (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
			) : (
				<Timeline items={items()} />
			)}
		</Card>
	)
}

export default DayInTheLife
