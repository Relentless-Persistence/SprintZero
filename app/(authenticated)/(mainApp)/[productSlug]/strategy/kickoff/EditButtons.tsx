import {Button} from "antd"

import type {FC} from "react"
import type {Promisable} from "type-fest"

export type EditButtonsProps = {
	onEditStart: () => void
	onEditEnd: () => void
	isEditing: boolean
	onCommit: () => Promisable<void>
}

const EditButtons: FC<EditButtonsProps> = ({onEditStart, onEditEnd, isEditing, onCommit}) => {
	if (isEditing) {
		return (
			<div className="flex gap-2">
				<Button size="small" onClick={() => onEditEnd()}>
					Cancel
				</Button>
				<Button
					type="primary"
					size="small"
					onClick={() => {
						Promise.resolve(onCommit())
							.then(() => {
								onEditEnd()
							})
							.catch(console.error)
					}}
				>
					Done
				</Button>
			</div>
		)
	} else {
		return (
			<Button size="small" onClick={() => onEditStart()}>
				Edit
			</Button>
		)
	}
}

export default EditButtons
