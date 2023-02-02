import React from "react"
import {Button} from "antd"
import {Card, Input, Space, Typography, message, Skeleton} from "antd"

const {TextArea} = Input
const {Text} = Typography

const Final = ({
	setCurrent,
	gptResponse,
	disabled,
	acceptedVision,
	setAcceptedVision,
	createVision,
	updateVision,
	id,
	setEditMode,
}) => {
	const onSave = () => {
		if (id) {
			updateVision()
		} else {
			createVision()
		}
	}

	const onCancel = () => {
		setEditMode(false)
	}

	return (
		<div style={{width: "100%"}} className="mb-7">
			<div>
				<Text className="text-[16px]">Finalize</Text>
			</div>
			<div>
				<Text className="text-sm text-black/[0.45]">Modify as you see fit</Text>
			</div>

			<Card
				style={{
					boxShadow:
						"0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)",
				}}
				className="mt-3"
			>
				<TextArea value={acceptedVision} rows={12} onChange={(e) => setAcceptedVision(e.target.value)} />
			</Card>
			<Space className="mt-6 flex justify-end">
				<Button onClick={onCancel}>Cancel</Button>
				<Button onClick={onSave} className="bg-green-s500 text-white">
					Save
				</Button>
			</Space>
		</div>
	)
}

export default Final
