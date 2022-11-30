import React, {useState} from "react"
import {Row, Col, Input, Form, Drawer, message} from "antd"
import styled from "styled-components"

import {Title} from "../Dashboard/SectionTitle"
import ActionButtons from "../Personas/ActionButtons"
import AppCheckbox from "../AppCheckbox"

import {db} from "../../config/firebase-config"

const {TextArea} = Input

const init = {
	actions: [
		{
			label: "Connect with Amy",
			checked: true,
		},
		{
			label: "Request Data from Finance Dept",
			checked: false,
		},
		{
			label: "Send sheet to John",
			checked: true,
		},
		{
			label: "Finalize presentation",
			checked: false,
		},
	],
}

const AddItem = ({show, setShow, product, user, type}) => {
	const [actions, setActions] = useState([])
	const [form] = Form.useForm()
	const [title, setTitle] = useState()
	const [description, setDescription] = useState()
	const [addAction, setAddAction] = useState(false)
	const [val, setVal] = useState("")

	const handleFinish = async () => {
		const data = {
			title,
			description,
			type,
			product_id: product.id,
			user: {
				id: user.uid,
				name: user.displayName,
				photo: user.photoURL || "https://joeschmoe.io/api/v1/random",
			},
      actions
		}

		if(title && description) {
      db.collection("Retrospectives")
				.add(data)
				.then((docRef) => {
					message.success("Retrospective submitted successfully")
					setShow(false)
					setActions([])
					setVal()
					form.resetFields()
				})
				.catch((error) => {
					message.error("Error adding Retrospective")
				})
    }
	}

	const handleChange = (e, field) => {
		setData({
			...data,
			[field]: e.target.value,
		})
	}

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			actions.push({
				name: e.target.value,
				completed: false,
			})
			setAddAction(false)
		}
	}

	return (
		<Drawer
			visible={show}
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
						<ActionButtons onCancel={() => setShow(false)} onSubmit={handleFinish} />
					</Col>
				</Row>
			}
		>
			<Form form={form} name="add_retro">
				<Row gutter={[24, 24]}>
					<Col span={13}>
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

						<Title className="mb-[8px] mt-[24px]">Proposed Actions</Title>

						<div>
							<Row>
								{actions.map((a, i) => (
									<Col span={8}>
										<AppCheckbox key={a.label} checked={a.checked}>
											{a.name}
										</AppCheckbox>
									</Col>
								))}
								{addAction ? (
									<Col span={8}>
										<Input onKeyPress={handleKeyDown} onChange={(e) => setVal(e.target.value)} value={val} />
									</Col>
								) : (
									<Col span={8}>
										<AppCheckbox checked={false} onChange={() => setAddAction((s) => !s)}>
											<span className="text-[#BFBFBF]">Add New</span>
										</AppCheckbox>
									</Col>
								)}
							</Row>
						</div>
					</Col>
					<Col span={11}>
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
							<TextArea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Drawer>
	)
}

export default AddItem
