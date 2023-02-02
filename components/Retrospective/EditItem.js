import React, {useState} from "react"
import {Row, Col, Input, Form, Drawer, message, Radio} from "antd"
import styled from "styled-components"

import {Title} from "../Dashboard/SectionTitle"
import ActionButtons from "../Personas/ActionButtons"
import AppCheckbox from "../AppCheckbox"

import {db} from "../../config/firebase-config"

const {TextArea} = Input

const types = [`Enjoyable`, `Puzzling`, `Frustrating`]

const EditItem = ({show, retro, setRetro, setEditMode}) => {
	const [actions, setActions] = useState(retro.actions)
	const [form] = Form.useForm()
	const [title, setTitle] = useState(retro.title)
	const [description, setDescription] = useState(retro.description)
	const [type, setType] = useState(retro.type)
	const [addAction, setAddAction] = useState(false)
	const [val, setVal] = useState("")

	const handleFinish = async () => {
		const data = {
			title,
			description,
			type,
			actions,
		}

		if (title && description) {
			db.collection("Retrospectives")
				.doc(retro.id)
				.update(data)
				.then((docRef) => {
					message.success("Retrospective updated successfully")
					setEditMode(false)
					setActions([])
					setTitle("")
					setDescription("")
					setType("")
					setVal()
				})
				.catch((error) => {
					console.log(error)
					message.error("Error adding Retrospective")
				})
		}
	}

	const handleKeyDown = (e) => {
		// let newActions = [...actions]
		if (e.key === "Enter") {
			let newActions = [...actions]
			newActions.push({
				name: e.target.value,
				completed: false,
			})
			setVal()
			setActions(newActions)
			setAddAction(false)
		}
	}

	const handleCheck = (i) => {
		const newActions = [...actions]
		newActions[i].completed = !newActions[i].completed
		setActions(newActions)
	}

	const onCancel = () => {
		setEditMode(false)
		setRetro(null)
	}

	return (
		<Drawer
			open={show}
			destroyOnClose={true}
			closable={false}
			placement={"bottom"}
			headerStyle={{background: "#F5F5F5"}}
			title={
				<Row>
					<Col span={12}>
						<h1 className="font-semibold">Retrospective Item</h1>
					</Col>
					<Col className="flex items-center justify-end" span={12}>
						<ActionButtons onCancel={onCancel} onSubmit={handleFinish} />
					</Col>
				</Row>
			}
		>
			<Form form={form} name="add_retro">
				<Row gutter={[40, 24]}>
					<Col span={14}>
						<Row gutter={18}>
							<Col span={12} className="w-full">
								<Title className="mb-[8px]">Title</Title>

								<Form.Item
									name="title"
									rules={[
										{
											required: true,
											message: "Please input a subject",
										},
									]}
								>
									<Input value={title} onChange={(e) => setTitle(e.target.value)} />
								</Form.Item>
							</Col>

							<Col span={12} className="w-full">
								<Title className="mb-[8px]">Category</Title>
								<Radio.Group onChange={(e) => setType(e.target.value)} value={type}>
									{types.map((item, i) => (
										<Radio.Button key={i} value={item}>
											{item}
										</Radio.Button>
									))}
								</Radio.Group>
							</Col>
						</Row>

						<div>
							<Title className="mb-[8px]">Description</Title>

							<Form.Item
								name="description"
								rules={[
									{
										required: true,
										message: "Please input a description",
									},
								]}
							>
								<TextArea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
							</Form.Item>
						</div>
					</Col>
					<Col span={10}>
						<Title className="mb-[8px]">Proposed Actions</Title>

						<div>
							<ul>
								{actions.map((a, i) => (
									<li>
										<AppCheckbox key={a.label} checked={a.completed} onChange={() => handleCheck(i)}>
											{a.name}
										</AppCheckbox>
									</li>
								))}
								{addAction ? (
									<li>
										<Input onKeyPress={handleKeyDown} onChange={(e) => setVal(e.target.value)} value={val} />
									</li>
								) : (
									<li>
										<AppCheckbox checked={false} onChange={() => setAddAction((s) => !s)}>
											<span className="text-[#BFBFBF]">Add New</span>
										</AppCheckbox>
									</li>
								)}
							</ul>
						</div>
					</Col>
				</Row>
			</Form>
		</Drawer>
	)
}

export default EditItem
