import {Button} from "antd5"

import type {FC} from "react"

export type EditButtonsProps = {
	onEditStart: () => void
	onEditEnd: () => void
	isEditing: boolean
	onCommit: () => void
}

const EditButtons: FC<EditButtonsProps> = ({onEditStart, onEditEnd, isEditing, onCommit}) => {
	if (isEditing) {
		return (
			<div className="flex gap-2">
				<Button size="small" onClick={() => void onEditEnd()}>
					Cancel
				</Button>
				<Button
					type="primary"
					size="small"
					className="bg-green-s500"
					onClick={() => {
						onCommit()
						onEditEnd()
					}}
				>
					Done
				</Button>
			</div>
		)
	} else {
		return (
			<button type="button" className="text-green-s500" onClick={() => void onEditStart()}>
				Edit
			</button>
		)
	}
}

export default EditButtons
