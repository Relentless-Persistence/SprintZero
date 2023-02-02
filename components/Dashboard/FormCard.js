import React, {useState} from "react"

import styled from "styled-components"

import {Card, Input, Space, Button} from "antd"

import CardHeaderButton, {CardHeaderLink} from "./CardHeaderButton"
import ActionButtons, {LightActionButtons} from "../Personas/ActionButtons"

const {TextArea} = Input

const MyCard = styled(Card)`
	.ant-card-head {
		min-height: unset;
		padding: 0 12px;
		border-bottom: 2px solid #d9d9d9;
	}

	.ant-card-head-title {
		padding: 0;
	}

	.ant-card-body {
		padding: 12px;
	}
`

export default function FormCard({
	isEdit,
	extra,
	itemToEdit,
	extraItems,
	onSubmit,
	className,
	headerSmall = false,
	onCancel,
	titlePlaceholder,
	descriptionPlaceholder,
}) {
	const [item, setItem] = useState(
		isEdit
			? {...itemToEdit}
			: {
					name: "",
					description: "",
			  },
	)

	const handleChange = (e, key) => {
		const {value} = e.target

		setItem({
			...item,
			[key]: value,
		})
	}

	const handleSubmit = () => {
		if (isEdit) {
			onSubmit({
				name: item.name || itemToEdit.name,
				description: item.description || itemToEdit.description,
			})
		} else {
			onSubmit(item)
		}
	}

	return headerSmall ? (
		<Card
			className={className}
			bordered={false}
			type="inner"
			extra={
				extra ? (
					extra
				) : (
					<Space>
						{/* <CardHeaderLink onClick={onCancel}>Cancel</CardHeaderLink>
            <Button className="ml-2" onClick={handleSubmit}>
              Done
            </Button> */}
						<ActionButtons onCancel={onCancel} onSubmit={handleSubmit} />
					</Space>
				)
			}
			title={<Input value={item.name} onChange={(e) => handleChange(e, "name")} placeholder={titlePlaceholder} />}
			headStyle={{
				background: "#F5F5F5",
			}}
		>
			<TextArea
				autoSize={{minRows: 6}}
				value={item.description}
				onChange={(e) => handleChange(e, "description")}
				placeholder={descriptionPlaceholder}
			/>

			{extraItems}
		</Card>
	) : (
		<Card
			className="border border-[#D9D9D9]"
			// bordered={false}
			type="inner"
			extra={
				extra ? (
					extra
				) : (
					<Space>
						{/* <CardHeaderLink onClick={onCancel}>Cancel</CardHeaderLink>
            <Button
              size="small"
              className="text-[#4A801D] border border-[#4A801D]"
              onClick={handleSubmit}
            >
              Done
            </Button> */}
						<ActionButtons onCancel={onCancel} onSubmit={handleSubmit} />
					</Space>
				)
			}
			title={<Input value={item.name} onChange={(e) => handleChange(e, "name")} placeholder={titlePlaceholder} />}
			headStyle={{
				background: "#F5F5F5",
			}}
		>
			<TextArea
				autoSize={{minRows: 6}}
				value={item.description}
				onChange={(e) => handleChange(e, "description")}
				placeholder={descriptionPlaceholder}
			/>
			{extraItems}
			<Button disabled block className="mt-2 bg-[#FF4D4F] text-white">
				Remove
			</Button>
		</Card>
	)
}

export function ObjectiveFormCard({isEdit, extra, itemToEdit, extraItems, onSubmit, onCancel, titlePlaceholder}) {
	const [item, setItem] = useState(
		isEdit
			? {...itemToEdit}
			: {
					name: "",
					description: "",
			  },
	)

	const handleChange = (e, key) => {
		const {value} = e.target

		setItem({
			...item,
			[key]: value,
		})
	}

	const handleSubmit = () => {
		if (isEdit) {
			onSubmit({
				name: item.name || itemToEdit.name,
				description: item.description || itemToEdit.description,
			})
		} else {
			onSubmit(item)
		}
	}

	return (
		<Card
			className="border border-[#D9D9D9]"
			type="inner"
			extra={
				extra ? (
					extra
				) : (
					<Space>
						<ActionButtons onCancel={onCancel} onSubmit={handleSubmit} />
					</Space>
				)
			}
			title={<Input value={item.name} onChange={(e) => handleChange(e, "name")} placeholder={titlePlaceholder} />}
			headStyle={{
				background: "#F5F5F5",
			}}
		>
			<TextArea
				autoSize={{minRows: 6}}
				value={item.description}
				onChange={(e) => handleChange(e, "description")}
				placeholder="Result description..."
			/>
			{extraItems}
			<Button disabled block className="mt-2 bg-[#FF4D4F] text-white">
				Remove
			</Button>
		</Card>
	)
}

export const ActionFormCard = ({
	title,
	description,
	id,
	useAction = true,
	version = 1,
	onSubmit,
	onCancel,
	className,
	extraItems,
	headerSmall = false,
	onDelete,
	isDisabled = false,
}) => {
	const [item, setItem] = useState({
		title,
		description,
	})

	const handleChange = (e, key) => {
		const {value} = e.target

		setItem({
			...item,
			id,
			[key]: value,
		})
	}

	const handleSubmit = () => {
		onSubmit(item)
		setItem({item: "", description: ""})
	}

	return (
		<Card
			className="mb-2 border-2"
			bordered={false}
			type="inner"
			extra={
				useAction ? (
					version === 1 ? (
						<ActionButtons className="ml-[12px]" onCancel={onCancel} onSubmit={handleSubmit} />
					) : (
						<LightActionButtons className="ml-[12px]" onCancel={onCancel} onSubmit={handleSubmit} />
					)
				) : (
					<CardHeaderLink onClick={handleSubmit}>Done</CardHeaderLink>
				)
			}
			title={<Input value={item.title} onChange={(e) => handleChange(e, "title")} placeholder="Result name..." />}
			headStyle={{
				background: "#F5F5F5",
			}}
		>
			{extraItems}
			<TextArea
				className="my-4"
				autoSize={{minRows: 3}}
				value={item.description}
				onChange={(e) => handleChange(e, "description")}
				placeholder="Result description..."
			/>
			<Button block className="mt-2 border-[#FF4D4F] text-[#FF4D4F]" onClick={onDelete} disabled={isDisabled}>
				Remove
			</Button>
		</Card>
	)
}

export const ObjectiveActionFormCard = ({
	name,
	description,
	id,
	useAction = true,
	version = 1,
	onSubmit,
	onCancel,
	className,
	extraItems,
	headerSmall = false,
	onDelete,
	isDisabled = false,
}) => {
	const [item, setItem] = useState({
		name,
		description,
	})

	const handleChange = (e, key) => {
		const {value} = e.target

		setItem({
			...item,
			id,
			[key]: value,
		})
	}

	const handleSubmit = () => {
		onSubmit(item)
		setItem({item: "", description: ""})
	}

	return (
		<Card
			className="mb-2 border-2"
			bordered={false}
			type="inner"
			extra={
				useAction ? (
					version === 1 ? (
						<ActionButtons className="ml-[12px]" onCancel={onCancel} onSubmit={handleSubmit} />
					) : (
						<LightActionButtons className="ml-[12px]" onCancel={onCancel} onSubmit={handleSubmit} />
					)
				) : (
					<CardHeaderLink onClick={handleSubmit}>Done</CardHeaderLink>
				)
			}
			title={<Input value={item.name} onChange={(e) => handleChange(e, "name")} placeholder="Result name..." />}
			headStyle={{
				background: "#F5F5F5",
			}}
		>
			{extraItems}
			<TextArea
				className="my-4"
				autoSize={{minRows: 3}}
				value={item.description}
				onChange={(e) => handleChange(e, "description")}
				placeholder="Result description..."
			/>
			<Button type="danger" ghost block onClick={onDelete} disabled={isDisabled}>
				Remove
			</Button>
		</Card>
	)
}

export const LearningsActionFormCard = ({
	title,
	description,
	artifact,
	id,
	useAction = true,
	version = 1,
	onSubmit,
	onCancel,
	className,
	extraItems,
	headerSmall = false,
	onDelete,
	isDisabled = false,
}) => {
	const [item, setItem] = useState({
		title,
		description,
		artifact,
	})

	const handleChange = (e, key) => {
		const {value} = e.target

		setItem({
			...item,
			id,
			[key]: value,
		})
	}

	const handleSubmit = () => {
		onSubmit(item)
		setItem({item: "", description: "", artifact: ""})
	}

	return (
		<Card
			className="mb-2 border-2"
			bordered={false}
			type="inner"
			extra={
				useAction ? (
					version === 1 ? (
						<ActionButtons className="ml-[12px]" onCancel={onCancel} onSubmit={handleSubmit} />
					) : (
						<LightActionButtons className="ml-[12px]" onCancel={onCancel} onSubmit={handleSubmit} />
					)
				) : (
					<CardHeaderLink onClick={handleSubmit}>Done</CardHeaderLink>
				)
			}
			title={<Input value={item.title} onChange={(e) => handleChange(e, "title")} placeholder="Learning name..." />}
			headStyle={{
				background: "#F5F5F5",
			}}
		>
			{extraItems}
			<TextArea
				className="my-4"
				autoSize={{minRows: 3}}
				value={item.description}
				onChange={(e) => handleChange(e, "description")}
				placeholder="Learning description..."
			/>
			<Input
				className="mt-4"
				value={item.artifact}
				addonBefore={<span>Artifact</span>}
				onChange={(e) => handleChange(e, "artifact")}
				placeholder="https://reduct.video/product/"
			/>
			<Button block className="mt-2 border-[#FF4D4F] text-[#FF4D4F]" onClick={onDelete} disabled={isDisabled}>
				Remove
			</Button>
		</Card>
	)
}
