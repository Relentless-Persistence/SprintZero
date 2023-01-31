import React, {useState} from "react"
import {Row, Col, Input, Form, Drawer, message, Radio} from "antd5"
import styled from "styled-components"

import {Title} from "~/components/Dashboard/SectionTitle"
import ActionButtons from "~/components/Personas/ActionButtons"
import AppCheckbox from "~/components/AppCheckbox"

import {doc, updateDoc} from "firebase9/firestore"
import {db} from "~/config/firebase"
import { notification } from "antd5"

const {TextArea} = Input

const types = [`Enjoyable`, `Puzzling`, `Frustrating`]

const EditItem = ({show, retro, setRetro, setEditMode}) => {
	const [actions, setActions] = useState(retro.actions)
	const [title, setTitle] = useState(retro.title)
	const [description, setDescription] = useState(retro.description)
	const [type, setType] = useState(retro.type)
	const [addAction, setAddAction] = useState(false)
	const [val, setVal] = useState("")

	const handleFinish = async () => {
    const docRef = doc(db, "Retrospectives", retro.id)
		const data = {
			title,
			description,
			type,
			actions,
		}

		if (title && description) {
      try {
        await updateDoc(docRef, data).then(() => {
					notification.success({message: "Retrospective updated successfully"})
					setEditMode(false)
					setActions([])
					setTitle("")
					setDescription("")
					setType("")
					setVal()
          setRetro(null)
				})
      } catch (error) {
        console.log(error)
				notification.error("Error adding Retrospective")
      }
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
			<Form name="add_retro">
				<Row gutter={[40, 24]}>
					<Col span={14}>
						<Row gutter={18}>
							<Col span={12} className="w-full">
								<Title className="mb-[8px]">Title</Title>

								<Form.Item
									// name="title"
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
